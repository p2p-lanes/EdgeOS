import { test, expect } from '@playwright/test';
import { buyPassesSelectors, getAttendeeSelector, getProductSelector } from '../selectors/passes';
import { authenticateAsPassesUser } from '../utils/auth';

test.describe('Buy Passes - Happy Path', () => {
  // Helper function to click on Buy Passes tab
  const clickBuyPassesTab = async (page: any) => {
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

  test.beforeEach(async ({ page }) => {
    // Authenticate the user before each test
    await authenticateAsPassesUser(page);
    
    // Navigate to the Edge Esmeralda passes page
    await page.goto('/portal/edge-esmeralda/passes', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Click on the Buy Passes tab
    await clickBuyPassesTab(page);
    
    // Wait for the Buy Passes container to be visible
    await expect(page.locator(buyPassesSelectors.container)).toBeVisible({ timeout: 10000 });
  });

  // Helper function to safely click an element with scroll and visibility check
  const safeClick = async (page: any, selector: string) => {
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click();
  };

  // Helper function to safely fill an input field with scroll and visibility check
  const safeFillInput = async (page: any, selector: string, value: string) => {
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.fill(value);
  };

  // Helper function to safely check a checkbox with scroll and visibility check
  const safeCheck = async (page: any, selector: string) => {
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.check();
  };

  // Helper function to get the first attendee ID from the page
  const getFirstAttendeeId = async (page: any): Promise<string> => {
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

  // Helper function to expand a collapsible if it's closed
  const expandCollapsibleIfClosed = async (page: any, collapsibleSelector: string, triggerSelector: string) => {
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

  test('should navigate to buy passes and select a ticket', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(30000);
    
    // Wait for the attendees list to load
    await page.locator(buyPassesSelectors.attendees.list).waitFor({ state: 'visible', timeout: 10000 });
    console.log('Attendees list is visible');
    
    // Get the first attendee ID
    const attendeeId = await getFirstAttendeeId(page);
    console.log(`First attendee ID: ${attendeeId}`);
    
    // Get attendee selectors
    const attendeeSelectors = getAttendeeSelector(attendeeId);
    
    // Try to expand both collapsibles (Local and Common)
    console.log('Attempting to expand collapsibles...');
    
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
    
    // Wait a bit for collapsibles to open
    await page.waitForTimeout(500);
    
    // Find ANY product button within the attendee products container (not disabled)
    // This will find products in either Local or Common sections
    const productsContainer = page.locator(attendeeSelectors.products);
    const productButton = productsContainer
      .locator('button[data-testid^="product-button-"]')
      .filter({ hasNot: page.locator('[disabled]') })
      .first();
    
    // Check if we found a product button
    const productCount = await productButton.count();
    console.log(`Found ${productCount} product buttons`);
    
    if (productCount === 0) {
      throw new Error('No product buttons found in the attendee products container');
    }
    
    // Wait for the product button to be visible
    await productButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Product button found and visible');
    
    // Get product ID and name for verification
    const testId = await productButton.getAttribute('data-testid');
    const productId = testId?.replace('product-button-', '') || '';
    const productName = await productButton.locator(`[data-testid="product-name-${productId}"]`).textContent();
    console.log(`Selecting product: ID=${productId}, Name=${productName}`);
    
    // Click the product to select it
    await productButton.scrollIntoViewIfNeeded();
    await productButton.click();
    console.log('Product clicked');
    
    // Wait for selection state to update
    await page.waitForTimeout(500);
    
    // Verify the product is now selected
    const isSelected = await productButton.getAttribute('data-product-selected');
    expect(isSelected).toBe('true');
    console.log('✓ Product is selected');
    
    // Scroll to the bottom of the page to see the total purchase section
    console.log('Scrolling to bottom of page...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify the total purchase section shows the selected item (use .first() to avoid strict mode violation)
    const totalPurchaseCollapsible = page.locator(buyPassesSelectors.totalPurchase.collapsible).first();
    await expect(totalPurchaseCollapsible).toBeVisible();
    console.log('✓ Total purchase section is visible');
    
    // Open the cart if it's closed
    const cartState = await totalPurchaseCollapsible.getAttribute('data-state');
    console.log(`Cart state: ${cartState}`);
    
    if (cartState === 'closed') {
      console.log('Opening cart...');
      const cartTrigger = page.locator(buyPassesSelectors.totalPurchase.trigger).first();
      await cartTrigger.scrollIntoViewIfNeeded();
      await cartTrigger.click();
      await page.waitForTimeout(300); // Wait for animation
    }
    
    // Check the waiver checkbox using JavaScript (most reliable method)
    console.log('Checking waiver checkbox...');
    
    // Wait a bit for any re-renders to settle
    await page.waitForTimeout(1000);
    
    // Use evaluate to click the checkbox directly in the DOM
    const checkboxClicked = await page.evaluate(() => {
      // Try to find the checkbox by various methods
      const checkbox = document.querySelector('[data-testid="waiver-checkbox-input"]') as HTMLElement;
      if (checkbox) {
        checkbox.click();
        return true;
      }
      
      // Fallback: try clicking the label
      const label = document.querySelector('[data-testid="waiver-checkbox-label"]') as HTMLElement;
      if (label) {
        label.click();
        return true;
      }
      
      return false;
    });
    
    if (!checkboxClicked) {
      throw new Error('Could not click waiver checkbox');
    }
    
    console.log('✓ Waiver checkbox clicked');
    
    // Wait for the checkbox state to update and button to be enabled
    await page.waitForTimeout(1000);
    
    // Capture the total amount before payment
    console.log('Capturing total amount before payment...');
    const totalElement = page.locator(buyPassesSelectors.totalPurchase.total).first();
    await totalElement.waitFor({ state: 'visible', timeout: 5000 });
    const totalText = await totalElement.textContent();
    console.log(`Total amount in cart: ${totalText}`);
    
    // Extract the numeric value from the total (e.g., "USD 200" -> "200")
    const expectedAmount = totalText?.match(/[\d,]+(\.\d{2})?/)?.[0].replace(',', '') || '';
    console.log(`Expected amount in SimpleFi: ${expectedAmount}`);
    
    // Click the "Confirm and Pay" button
    console.log('Clicking Confirm and Pay button...');
    const confirmButton = page.locator(buyPassesSelectors.completePurchaseButton).first();
    await confirmButton.scrollIntoViewIfNeeded();
    await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
    await confirmButton.click();
    console.log('✓ Confirm and Pay button clicked');
    
    // Wait for navigation to checkout/payment page (containing 'simplefi.tech')
    console.log('Waiting for navigation to payment page...');
    await page.waitForURL(url => url.href.includes('simplefi.tech'), { timeout: 30000 });
    console.log('✓ Redirected to checkout page');
    
    // Verify we're on the checkout page
    expect(page.url()).toContain('simplefi.tech');
    console.log(`✓ Current URL: ${page.url()}`);
    
    // Wait for the payment page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Give time for dynamic content to load
    
    // Find and verify the amount on SimpleFi payment page
    console.log('Verifying amount on SimpleFi payment page...');
    
    // Try to find the amount display (looking for text containing the expected amount)
    const amountOnPage = await page.locator(`text=/USD.*${expectedAmount}|\\$.*${expectedAmount}|${expectedAmount}|${Number(expectedAmount).toFixed(0)}/`).first();
    
    // Wait for the amount to be visible
    await amountOnPage.waitFor({ state: 'visible', timeout: 10000 });
    const displayedAmount = await amountOnPage.textContent();
    console.log(`Amount displayed on SimpleFi: ${displayedAmount}`);
    
    // Verify the amount matches
    expect(displayedAmount).toContain(Number(expectedAmount).toFixed(0));
    console.log(`✓ Amount verification passed: Expected ${expectedAmount}, found ${displayedAmount}`);
    
    console.log('\n=== TEST PASSED: Successfully selected a ticket, confirmed purchase, and navigated to checkout ===');
  });
});

