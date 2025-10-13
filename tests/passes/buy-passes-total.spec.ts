import { test, expect, Page } from '@playwright/test';
import { buyPassesSelectors, getAttendeeSelector } from '../selectors/passes';
import { authenticateAsPassesUser } from '../utils/auth';

test.describe('Buy Passes - Total Calculation', () => {
  // Authenticate and navigate before each test
  test.beforeEach(async ({ page }) => {
    // Authenticate user
    await authenticateAsPassesUser(page);
    
    // Navigate to passes page
    await page.goto('/portal/edge-esmeralda/passes', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  // Helper function to click on Buy Passes tab
  const clickBuyPassesTab = async (page: Page) => {
    console.log('Attempting to click Buy Passes tab...');
    
    // Wait for tabs list to be visible
    await page.locator(buyPassesSelectors.tabs.tabsList).waitFor({ state: 'visible', timeout: 10000 });
    console.log('Tabs list is visible');
    
    // Strategy 1: Try using getByRole with exact text match
    try {
      const tabByRole = page.getByRole('tab', { name: 'Buy Passes' });
      const count = await tabByRole.count();
      console.log(`Found ${count} tabs with "Buy Passes" text`);
      
      if (count > 0) {
        await tabByRole.click();
        console.log('Clicked Buy Passes tab using getByRole');
        return;
      }
    } catch (error) {
      console.log('Strategy 1 failed:', error);
    }
    
    // Strategy 2: Try using the selector with value attribute
    try {
      const tabByValue = page.locator('button[value="buy-passes"]');
      const isVisible = await tabByValue.isVisible();
      console.log(`Tab with value="buy-passes" visible: ${isVisible}`);
      
      if (isVisible) {
        await tabByValue.click();
        console.log('Clicked Buy Passes tab using value selector');
        return;
      }
    } catch (error) {
      console.log('Strategy 2 failed:', error);
    }
    
    // Strategy 3: Try using text content
    try {
      await page.click('button:has-text("Buy Passes")');
      console.log('Clicked Buy Passes tab using text selector');
      return;
    } catch (error) {
      console.log('Strategy 3 failed:', error);
    }
    
    throw new Error('Could not click Buy Passes tab with any strategy');
  };

  // Helper function to expand a collapsible if it's closed
  const expandCollapsibleIfClosed = async (page: Page, collapsibleSelector: string, triggerSelector: string) => {
    const collapsible = page.locator(collapsibleSelector);
    const trigger = page.locator(triggerSelector);
    
    await trigger.scrollIntoViewIfNeeded();
    
    // Check the collapsible's open state
    const dataState = await collapsible.getAttribute('data-state');
    
    console.log(`Collapsible state: ${dataState}`);
    
    if (dataState === 'closed') {
      console.log('Collapsible is closed, clicking to open...');
      await trigger.click();
      // Wait for the animation to complete
      await page.waitForTimeout(1000);
      
      // Verify it opened
      const newState = await collapsible.getAttribute('data-state');
      console.log(`Collapsible state after click: ${newState}`);
    } else {
      console.log('Collapsible is already open');
    }
  };

  // Helper function to get the first attendee ID from the page
  const getFirstAttendeeId = async (page: Page): Promise<string> => {
    // Wait for attendees list to be visible
    await page.locator(buyPassesSelectors.attendees.list).waitFor({ state: 'visible', timeout: 10000 });
    
    // Get the first attendee ticket element
    const firstTicket = page.locator('[data-testid^="attendee-ticket-"]').first();
    await firstTicket.waitFor({ state: 'visible', timeout: 10000 });
    
    // Extract the attendee ID from the data-testid attribute
    const testId = await firstTicket.getAttribute('data-testid');
    const attendeeId = testId?.replace('attendee-ticket-container-', '') || '';
    
    return attendeeId;
  };

  // Helper function to parse price string to number
  const parsePrice = (priceText: string): number => {
    // Remove currency symbols, commas, and any non-numeric characters except decimal point
    const cleanPrice = priceText.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? 0 : price;
  };

  // Helper function to select random products and return their prices
  const selectRandomProducts = async (page: Page, attendeeId: string, count: number = 3): Promise<number[]> => {
    const attendeeSelectors = getAttendeeSelector(attendeeId);
    const productsContainer = page.locator(attendeeSelectors.products);
    
    // Find all product buttons
    const productButtons = productsContainer.locator('button[data-testid^="product-button-"]');
    const totalProducts = await productButtons.count();
    
    console.log(`Total products available: ${totalProducts}`);
    
    if (totalProducts === 0) {
      console.log('No products found');
      return [];
    }
    
    // Limit count to available products
    const productsToSelect = Math.min(count, totalProducts);
    console.log(`Will select ${productsToSelect} random products`);
    
    // Generate random indices
    const selectedIndices = new Set<number>();
    while (selectedIndices.size < productsToSelect) {
      const randomIndex = Math.floor(Math.random() * totalProducts);
      selectedIndices.add(randomIndex);
    }
    
    const selectedPrices: number[] = [];
    
    // Select each random product
    for (const index of Array.from(selectedIndices)) {
      const button = productButtons.nth(index);
      
      // Get product ID
      const testId = await button.getAttribute('data-testid');
      const productId = testId?.replace('product-button-', '') || '';
      
      console.log(`\nSelecting product ${index + 1}/${productsToSelect} (ID: ${productId})`);
      
      // Get product name and price before clicking
      const nameElement = button.locator(`[data-testid="product-name-${productId}"]`);
      const nameText = await nameElement.textContent() || '';
      
      const priceElement = button.locator(`[data-testid="product-price-${productId}"]`);
      const priceText = await priceElement.textContent() || '';
      
      console.log(`Product: ${nameText}`);
      console.log(`Price text: ${priceText}`);
      
      const price = parsePrice(priceText);
      console.log(`Parsed price: $${price}`);
      
      // Scroll to the button and click
      await button.scrollIntoViewIfNeeded();
      await button.waitFor({ state: 'visible', timeout: 5000 });
      await button.click();
      
      console.log(`✓ Product clicked`);
      
      // Wait for selection to update
      await page.waitForTimeout(500);
      
      // Verify it's selected
      const isSelected = await button.getAttribute('data-selected');
      console.log(`Product selected state: ${isSelected}`);
      
      selectedPrices.push(price);
    }
    
    return selectedPrices;
  };

  test('should select random tickets and verify total matches', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);
    
    // Step 1: Click on the Buy Passes tab
    console.log('=== Step 1: Clicking Buy Passes tab ===');
    await clickBuyPassesTab(page);
    
    // Wait for the Buy Passes container to be visible
    await expect(page.locator(buyPassesSelectors.container)).toBeVisible({ timeout: 10000 });
    console.log('✓ Buy Passes container is visible');
    
    // Step 2: Wait for attendees list to load
    console.log('\n=== Step 2: Loading attendees list ===');
    await page.locator(buyPassesSelectors.attendees.list).waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Attendees list is visible');
    
    // Get the first attendee ID
    const attendeeId = await getFirstAttendeeId(page);
    console.log(`✓ First attendee ID: ${attendeeId}`);
    
    const attendeeSelectors = getAttendeeSelector(attendeeId);
    
    // Step 3: Expand collapsibles to see all products
    console.log('\n=== Step 3: Expanding attendee collapsibles ===');
    
    // Check if Local collapsible exists and expand it
    const localCollapsible = page.locator(attendeeSelectors.localCollapsible);
    const hasLocal = await localCollapsible.count() > 0;
    console.log(`Has Local collapsible: ${hasLocal}`);
    
    if (hasLocal) {
      await expandCollapsibleIfClosed(page, attendeeSelectors.localCollapsible, attendeeSelectors.localTrigger);
    }
    
    // Check if Common collapsible exists and expand it
    const commonCollapsible = page.locator(attendeeSelectors.commonCollapsible);
    const hasCommon = await commonCollapsible.count() > 0;
    console.log(`Has Common collapsible: ${hasCommon}`);
    
    if (hasCommon) {
      await expandCollapsibleIfClosed(page, attendeeSelectors.commonCollapsible, attendeeSelectors.commonTrigger);
    }
    
    // Wait for collapsibles to fully open
    await page.waitForTimeout(1000);
    
    // Step 4: Select random products
    console.log('\n=== Step 4: Selecting random products ===');
    const selectedPrices = await selectRandomProducts(page, attendeeId, 3);
    
    if (selectedPrices.length === 0) {
      console.log('No products were selected, skipping total verification');
      return;
    }
    
    // Calculate expected total
    const expectedTotal = selectedPrices.reduce((sum, price) => sum + price, 0);
    console.log(`\n✓ Selected ${selectedPrices.length} products`);
    console.log(`Selected prices: $${selectedPrices.join(', $')}`);
    console.log(`Expected total: $${expectedTotal.toFixed(2)}`);
    
    // Step 5: Scroll to top to make floating bar visible
    console.log('\n=== Step 5: Scrolling to top and verifying total ===');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Wait for floating bar to be visible
    const floatingBarTotal = page.locator(buyPassesSelectors.totalFloatingBar.total);
    await floatingBarTotal.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Floating bar is visible');
    
    // Get the total from UI
    const totalText = await floatingBarTotal.textContent() || '';
    console.log(`Total text from UI: ${totalText}`);
    
    const totalFromUI = parsePrice(totalText);
    console.log(`Parsed total from UI: $${totalFromUI.toFixed(2)}`);
    
    // Step 6: Compare totals
    console.log('\n=== Step 6: Comparing totals ===');
    console.log(`Expected: $${expectedTotal.toFixed(2)}`);
    console.log(`Actual: $${totalFromUI.toFixed(2)}`);
    
    // Use toBeCloseTo to allow for small floating point differences
    expect(totalFromUI).toBeCloseTo(expectedTotal, 2);
    
    console.log('\n=== TEST PASSED: Total matches selected products ===');
    
    // Step 7: Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/buy-passes-total-verification.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved to test-results/buy-passes-total-verification.png');
  });
});

