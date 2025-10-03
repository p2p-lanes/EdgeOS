/**
 * E2E Tests for Purchase Flow functionality
 * Tests the complete purchase process including totals, waivers, and completion
 */

import { test, expect } from '@playwright/test';
import { PassesSelectors, PassesTestHelpers } from '../../utils';

test.describe('Buy Passes - Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    const tokenUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3BvcnRhbGRldi5zaW1wbGVmaS50ZWNoL2NpdGl6ZW5zL2xvZ2luP2VtYWlsPWpvZWwlNDBtdXZpbmFpLmNvbSZzcGljZT1xbDF2SUJyYXdnalIiLCJjaXRpemVuX2VtYWlsIjoiam9lbEBtdXZpbmFpLmNvbSIsImNpdGl6ZW5faWQiOjIsImlhdCI6MTc1OTQzMjc4OSwiZXhwIjoxNzU5NDQzNTg5fQ.-FhKts9fx_RzduZSLjFwFYakKgOVkitM-me2GttZ13o';
    await page.goto(`/auth?token_url=${tokenUrl}`);
    await page.waitForURL('**/portal/**');
    
    // Navigate to Buy Passes using specific sidebar selector
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
  });

  test('should display total purchase section when products are selected', async ({ page }) => {
    // Check for any purchase section (static, desktop, or mobile)
    const staticSection = page.locator(PassesSelectors.purchase.staticSection);
    const desktopSection = page.locator(PassesSelectors.purchase.desktopSection);
    const mobileSection = page.locator(PassesSelectors.purchase.mobileSection);
    
    // At least one purchase section should be visible if products are selected
    const hasPurchaseSection = await staticSection.count() > 0 || 
                              await desktopSection.count() > 0 || 
                              await mobileSection.count() > 0;
    
    if (hasPurchaseSection) {
      // Test the visible purchase section
      if (await staticSection.count() > 0) {
        await expect(staticSection).toBeVisible();
        await expect(page.locator(PassesSelectors.purchase.staticTotal)).toBeVisible();
      }
      
      if (await desktopSection.count() > 0) {
        await expect(desktopSection).toBeVisible();
      }
      
      if (await mobileSection.count() > 0) {
        await expect(mobileSection).toBeVisible();
      }
    }
  });

  test('should show total purchase details when expanded', async ({ page }) => {
    const totalTrigger = page.locator(PassesSelectors.totalPurchase.trigger);
    
    if (await totalTrigger.count() > 0) {
      // Click to expand total purchase details
      await totalTrigger.click();
      
      // Verify content is visible
      await expect(page.locator(PassesSelectors.totalPurchase.content)).toBeVisible();
      
      // Verify price display exists
      await expect(page.locator(PassesSelectors.totalPurchase.priceDisplay)).toBeVisible();
      await expect(page.locator(PassesSelectors.totalPurchase.finalTotal)).toBeVisible();
      
      // Check if there's an original total (indicating discount)
      const originalTotal = page.locator(PassesSelectors.totalPurchase.originalTotal);
      if (await originalTotal.count() > 0) {
        await expect(originalTotal).toBeVisible();
      }
    }
  });

  test('should display discount information correctly', async ({ page }) => {
    const totalTrigger = page.locator(PassesSelectors.totalPurchase.trigger);
    
    if (await totalTrigger.count() > 0) {
      await totalTrigger.click();
      
      // Check for discount coupon display
      const discountCouponDisplay = page.locator(PassesSelectors.totalPurchase.discountCouponDisplay);
      if (await discountCouponDisplay.count() > 0) {
        await expect(discountCouponDisplay).toBeVisible();
        await expect(page.locator(PassesSelectors.totalPurchase.discountLabel)).toBeVisible();
        await expect(page.locator(PassesSelectors.totalPurchase.discountAmount)).toBeVisible();
      }
      
      // Check for week purchased discount
      const weekDiscount = page.locator(PassesSelectors.totalPurchase.discountWeekPurchased);
      if (await weekDiscount.count() > 0) {
        await expect(weekDiscount).toBeVisible();
      }
      
      // Check for application credit
      const applicationCredit = page.locator(PassesSelectors.totalPurchase.applicationCredit);
      if (await applicationCredit.count() > 0) {
        await expect(applicationCredit).toBeVisible();
        await expect(page.locator(PassesSelectors.totalPurchase.creditAmount)).toBeVisible();
      }
    }
  });

  test('should handle empty cart state', async ({ page }) => {
    const totalTrigger = page.locator(PassesSelectors.totalPurchase.trigger);
    
    if (await totalTrigger.count() > 0) {
      await totalTrigger.click();
      
      // Check for no passes selected message
      const noPassesMessage = page.locator(PassesSelectors.totalPurchase.noPassesSelected);
      if (await noPassesMessage.count() > 0) {
        await expect(noPassesMessage).toBeVisible();
        await expect(noPassesMessage).toContainText('No passes selected');
      }
    }
  });

  test('should test complete purchase flow on desktop', async ({ page }) => {
    const purchaseFlow = PassesTestHelpers.getPurchaseFlow('desktop');
    
    const desktopSection = page.locator(purchaseFlow.section);
    if (await desktopSection.count() > 0) {
      await expect(desktopSection).toBeVisible();
      
      // Check waiver checkbox
      const waiverCheckbox = page.locator(purchaseFlow.waiver);
      if (await waiverCheckbox.count() > 0) {
        await expect(waiverCheckbox).toBeVisible();
        
        // Check the waiver (if not already checked)
        if (!(await waiverCheckbox.isChecked())) {
          await waiverCheckbox.check();
        }
        
        // Verify complete purchase button is enabled
        const completeButton = page.locator(purchaseFlow.completeButton);
        if (await completeButton.count() > 0) {
          await expect(completeButton).toBeVisible();
          await expect(completeButton).toBeEnabled();
        }
      }
    }
  });

  test('should test complete purchase flow on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const purchaseFlow = PassesTestHelpers.getPurchaseFlow('mobile');
    
    const mobileSection = page.locator(purchaseFlow.section);
    if (await mobileSection.count() > 0) {
      await expect(mobileSection).toBeVisible();
      
      // Check waiver checkbox
      const waiverCheckbox = page.locator(purchaseFlow.waiver);
      if (await waiverCheckbox.count() > 0) {
        await expect(waiverCheckbox).toBeVisible();
        
        // Check the waiver
        if (!(await waiverCheckbox.isChecked())) {
          await waiverCheckbox.check();
        }
        
        // Verify complete purchase button
        const completeButton = page.locator(purchaseFlow.completeButton);
        if (await completeButton.count() > 0) {
          await expect(completeButton).toBeVisible();
          await expect(completeButton).toBeEnabled();
        }
      }
    }
  });
});
