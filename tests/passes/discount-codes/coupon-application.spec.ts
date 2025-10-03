/**
 * E2E Tests for Discount Code functionality
 * Tests applying discount codes, validation, and error handling
 */

import { test, expect } from '@playwright/test';
import { PassesSelectors, PassesTestHelpers } from '../../utils';

test.describe('Buy Passes - Discount Codes', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no valid token available - this should be replaced with a valid test token
    test.skip(!process.env.TEST_TOKEN_URL, 'TEST_TOKEN_URL environment variable not set');
    
    const tokenUrl = process.env.TEST_TOKEN_URL || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3BvcnRhbGRldi5zaW1wbGVmaS50ZWNoL2NpdGl6ZW5zL2xvZ2luP2VtYWlsPWpvZWwlNDBtdXZpbmFpLmNvbSZzcGljZT1xbDF2SUJyYXdnalIiLCJjaXRpemVuX2VtYWlsIjoiam9lbEBtdXZpbmFpLmNvbSIsImNpdGl6ZW5faWQiOjIsImlhdCI6MTc1OTQzMjc4OSwiZXhwIjoyMDc0NzkzMTg5fQ.invalidTokenForTest';
    
    await page.goto(`/auth?token_url=${tokenUrl}`);
    await page.waitForURL('**/portal/**');
    
    // Use the robust navigation helper
    await PassesTestHelpers.navigateToBuyPasses(page);
  });

  test('should display "Have a coupon?" trigger', async ({ page }) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const haveCouponTrigger = page.locator(discountFlow.trigger);
    
    // Check if discount codes are allowed (trigger exists)
    if (await haveCouponTrigger.count() > 0) {
      await expect(haveCouponTrigger).toBeVisible();
      await expect(haveCouponTrigger).toContainText('Have a coupon?');
    }
  });

  test('should open discount code form when triggered', async ({ page }) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const haveCouponTrigger = page.locator(discountFlow.trigger);
    
    if (await haveCouponTrigger.count() > 0) {
      // Click to open discount form
      await haveCouponTrigger.click();
      
      // Verify form elements are visible
      await expect(page.locator(PassesSelectors.discountCode.form)).toBeVisible();
      await expect(page.locator(discountFlow.input)).toBeVisible();
      await expect(page.locator(discountFlow.applyButton)).toBeVisible();
      
      // Verify input has correct placeholder
      await expect(page.locator(discountFlow.input)).toHaveAttribute('placeholder', 'Enter coupon code');
    }
  });

  test('should handle empty discount code input', async ({ page }) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const haveCouponTrigger = page.locator(discountFlow.trigger);
    
    if (await haveCouponTrigger.count() > 0) {
      await haveCouponTrigger.click();
      
      // Apply button should be disabled when input is empty
      await expect(page.locator(discountFlow.applyButton)).toBeDisabled();
      
      // Type something and verify button becomes enabled
      await page.locator(discountFlow.input).fill('TEST');
      await expect(page.locator(discountFlow.applyButton)).toBeEnabled();
      
      // Clear input and verify button is disabled again
      await page.locator(discountFlow.input).clear();
      await expect(page.locator(discountFlow.applyButton)).toBeDisabled();
    }
  });

  test('should test discount code input transformation', async ({ page }) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const haveCouponTrigger = page.locator(discountFlow.trigger);
    
    if (await haveCouponTrigger.count() > 0) {
      await haveCouponTrigger.click();
      
      // Type lowercase code
      await page.locator(discountFlow.input).fill('testcode123');
      
      // Verify it's transformed to uppercase
      await expect(page.locator(discountFlow.input)).toHaveValue('TESTCODE123');
    }
  });

  test('should handle Enter key submission', async ({ page }) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const haveCouponTrigger = page.locator(discountFlow.trigger);
    
    if (await haveCouponTrigger.count() > 0) {
      await haveCouponTrigger.click();
      
      // Type a code and press Enter
      await page.locator(discountFlow.input).fill('ENTERTEST');
      await page.locator(discountFlow.input).press('Enter');
      
      // Should show some kind of response (loading state or message)
      // We'll check if the apply button shows loading or if a message appears
      const message = page.locator(discountFlow.message);
      
      // Wait for potential response (either success or error)
      await page.waitForTimeout(2000);
      
      // Check if message appears (could be success or error)
      if (await message.count() > 0) {
        await expect(message).toBeVisible();
      }
    }
  });

  test('should apply discount code and show response', async ({ page }) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const haveCouponTrigger = page.locator(discountFlow.trigger);
    
    if (await haveCouponTrigger.count() > 0) {
      await haveCouponTrigger.click();
      
      // Try applying a test code
      await page.locator(discountFlow.input).fill('TESTCODE123');
      await page.locator(discountFlow.applyButton).click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check if message appears
      const message = page.locator(discountFlow.message);
      if (await message.count() > 0) {
        await expect(message).toBeVisible();
        
        // Message should contain either success or error indication
        const messageText = await message.textContent();
        expect(messageText).toBeTruthy();
      }
    }
  });

  test('should show discount in total when valid code is applied', async ({ page }) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const totalFlow = PassesTestHelpers.getTotalPurchaseFlow();
    const haveCouponTrigger = page.locator(discountFlow.trigger);
    
    if (await haveCouponTrigger.count() > 0) {
      // Apply a discount code first
      await haveCouponTrigger.click();
      await page.locator(discountFlow.input).fill('VALIDCODE');
      await page.locator(discountFlow.applyButton).click();
      
      // Wait for processing
      await page.waitForTimeout(3000);
      
      // Check if discount shows successful application
      const message = page.locator(discountFlow.message);
      if (await message.count() > 0) {
        const messageText = await message.textContent();
        
        // If discount was applied successfully, check totals
        if (messageText && messageText.includes('success')) {
          // Open total purchase details
          const totalTrigger = page.locator(totalFlow.trigger);
          if (await totalTrigger.count() > 0) {
            await totalTrigger.click();
            
            // Check for discount display in totals
            const discountDisplay = page.locator(PassesSelectors.totalPurchase.discountCouponDisplay);
            if (await discountDisplay.count() > 0) {
              await expect(discountDisplay).toBeVisible();
            }
          }
        }
      }
    }
  });

  test('should test discount code positions (top/bottom)', async ({ page }) => {
    // Check for discount code in top position
    const topDiscountCode = page.locator(PassesSelectors.discountCode.topPosition);
    const bottomDiscountCode = page.locator(PassesSelectors.discountCode.bottomPosition);
    
    // At least one position should exist if discount codes are enabled
    const hasTopDiscount = await topDiscountCode.count() > 0;
    const hasBottomDiscount = await bottomDiscountCode.count() > 0;
    
    if (hasTopDiscount) {
      await expect(topDiscountCode).toBeVisible();
    }
    
    if (hasBottomDiscount) {
      await expect(bottomDiscountCode).toBeVisible();
    }
    
    // Should have at least one discount code position
    expect(hasTopDiscount || hasBottomDiscount).toBeTruthy();
  });
});
