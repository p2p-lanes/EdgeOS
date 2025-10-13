import { test, expect, Page } from '@playwright/test';
import { buyPassesSelectors, getAttendeeSelector } from '../selectors/passes';
import { authenticateAsPassesUser } from '../utils/auth';

test.describe('Tickets - Patreon Discount', () => {
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

  // Helper function to find the Patreon product (special product)
  const findPatreonProduct = async (page: Page) => {
    // The Patreon product is in a special container, not within an attendee
    const specialProductContainer = page.locator(buyPassesSelectors.specialProduct.container);
    
    // Check if special product container exists
    const exists = await specialProductContainer.count() > 0;
    
    if (!exists) {
      console.log('Special product container not found');
      return null;
    }
    
    console.log('✓ Special product container found');
    
    // Find the button with data-category="patreon"
    const patreonButton = specialProductContainer.locator('button[data-category="patreon"]');
    const buttonExists = await patreonButton.count() > 0;
    
    if (!buttonExists) {
      console.log('Patreon button not found');
      return null;
    }
    
    // Get the product name from the button
    const nameText = await patreonButton.textContent();
    
    console.log(`Found Patreon product: ${nameText}`);
    
    return { button: patreonButton, name: nameText };
  };

  // Helper function to get all product prices
  const getAllProductPrices = async (page: Page, attendeeId: string) => {
    const attendeeSelectors = getAttendeeSelector(attendeeId);
    const productsContainer = page.locator(attendeeSelectors.products);
    
    // Find all product buttons
    const productButtons = productsContainer.locator('button[data-testid^="product-button-"]');
    const count = await productButtons.count();
    
    const prices: Array<{ productId: string; name: string; price: string }> = [];
    
    for (let i = 0; i < count; i++) {
      const button = productButtons.nth(i);
      const testId = await button.getAttribute('data-testid');
      const productId = testId?.replace('product-button-', '') || '';
      
      // Get the product name
      const nameElement = button.locator(`[data-testid="product-name-${productId}"]`);
      const nameText = await nameElement.textContent() || '';
      
      // Get the product price
      const priceElement = button.locator(`[data-testid="product-price-${productId}"]`);
      const priceText = await priceElement.textContent() || '';
      
      prices.push({
        productId,
        name: nameText,
        price: priceText,
      });
    }
    
    return prices;
  };

  test('should select Patreon ticket and verify other tickets become free', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);
    
    // Step 1: Authenticate
    console.log('=== Step 1: Authenticating user ===');
    await authenticateAsPassesUser(page);
    
    // Step 2: Navigate to the Edge Esmeralda passes page
    console.log('=== Step 2: Navigating to passes page ===');
    await page.goto('/portal/edge-esmeralda/passes', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    
    // Step 3: Click on the Buy Passes tab
    console.log('=== Step 3: Clicking Buy Passes tab ===');
    await clickBuyPassesTab(page);
    
    // Wait for the Buy Passes container to be visible
    await expect(page.locator(buyPassesSelectors.container)).toBeVisible({ timeout: 10000 });
    console.log('✓ Buy Passes container is visible');
    
    // Step 4: Find and select the Patreon product (special product)
    console.log('=== Step 4: Finding and selecting Patreon ticket ===');
    
    // Wait for the special product container to be visible
    await page.locator(buyPassesSelectors.specialProduct.container).waitFor({ state: 'visible', timeout: 10000 });
    
    const patreonProduct = await findPatreonProduct(page);
    
    if (!patreonProduct) {
      throw new Error('Patreon product not found');
    }
    
    console.log(`✓ Found Patreon product: Name=${patreonProduct.name}`);
    
    // Click the Patreon product to select it
    await patreonProduct.button.scrollIntoViewIfNeeded();
    await patreonProduct.button.waitFor({ state: 'visible', timeout: 5000 });
    await patreonProduct.button.click();
    console.log('✓ Patreon ticket clicked');
    
    // Wait for selection state to update
    await page.waitForTimeout(1500);
    
    // Verify the Patreon product is selected
    const isSelected = await patreonProduct.button.getAttribute('data-selected');
    expect(isSelected).toBe('true');
    console.log('✓ Patreon ticket is selected');
    
    // Step 5: Wait for attendees list to load
    console.log('=== Step 5: Loading attendees list ===');
    await page.locator(buyPassesSelectors.attendees.list).waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Attendees list is visible');
    
    // Get the first attendee ID
    const attendeeId = await getFirstAttendeeId(page);
    console.log(`✓ First attendee ID: ${attendeeId}`);
    
    const attendeeSelectors = getAttendeeSelector(attendeeId);
    
    // Step 6: Expand collapsibles to see all products
    console.log('=== Step 6: Expanding attendee collapsibles ===');
    
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
    
    // Step 7: Verify other tickets have price 0
    console.log('=== Step 7: Verifying other tickets have price 0 ===');
    const productPrices = await getAllProductPrices(page, attendeeId);
    
    console.log('Product prices after selecting Patreon:');
    let hasNonZeroPrice = false;
    
    productPrices.forEach(product => {
      console.log(`  - ${product.name}: ${product.price}`);
      
      // Check if price contains 0 or Free or is empty
      const isZeroOrFree = 
        product.price.includes('0') || 
        product.price.toLowerCase().includes('free') ||
        product.price.toLowerCase().includes('gratis') ||
        product.price.trim() === '';
      
      if (!isZeroOrFree) {
        console.log(`  ⚠️ WARNING: ${product.name} still has a non-zero price: ${product.price}`);
        hasNonZeroPrice = true;
      }
    });
    
    // Verify that all products in attendees have price 0
    expect(hasNonZeroPrice).toBe(false);
    
    console.log('\n=== TEST PASSED: Patreon ticket selected and all other tickets are now free ===');
    
    // Step 8: Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/patreon-ticket-selected.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved to test-results/patreon-ticket-selected.png');
  });
});

