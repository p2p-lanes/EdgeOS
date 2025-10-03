/**
 * Example usage of Buy Passes test selectors with Playwright
 * This file demonstrates how to use the selectors in your E2E tests
 */

import { test, expect } from '@playwright/test';
import { PassesSelectors, PassesTestHelpers } from './index';

test.describe('Buy Passes Flow Examples', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with authentication token
    const tokenUrl = 'your-auth-token-here';
    await page.goto(`/auth?token_url=${tokenUrl}`);
    await page.waitForURL('**/portal/**');
  });

  test('should navigate to buy passes tab and select products', async ({ page }) => {
    // Navigate to passes section and buy passes tab using specific sidebar selector
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
    
    // Verify buy passes content is visible
    await expect(page.locator(PassesSelectors.buyPasses.container)).toBeVisible();
    
    // Click on main attendee's common products trigger
    const mainAttendee = '1'; // Assuming first attendee has id 1
    const attendeeProducts = PassesTestHelpers.getAttendeeProducts(mainAttendee);
    await page.locator(attendeeProducts.commonTrigger).click();
    
    // Select a product (example with product ID)
    await page.locator(PassesSelectors.attendeeTicket.product('product-123', mainAttendee)).click();
    
    // Open discount code form
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    await page.locator(discountFlow.trigger).click();
    
    // Enter discount code
    await page.locator(discountFlow.input).fill('TESTCODE123');
    await page.locator(discountFlow.applyButton).click();
    
    // Verify discount message appears
    await expect(page.locator(discountFlow.message)).toBeVisible();
    
    // Open total purchase details
    const totalFlow = PassesTestHelpers.getTotalPurchaseFlow();
    await page.locator(totalFlow.trigger).click();
    
    // Verify total displays
    await expect(page.locator(totalFlow.finalTotal)).toContainText('$');
    
    // Complete purchase (desktop flow)
    const purchaseFlow = PassesTestHelpers.getPurchaseFlow('desktop');
    const waiverCheckbox = page.locator(purchaseFlow.waiver);
    if (await waiverCheckbox.count() > 0) {
      await waiverCheckbox.check();
      await page.locator(purchaseFlow.completeButton).click();
    }
  });

  test('should test mobile purchase flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to buy passes using specific sidebar selector
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
    
    // Test mobile-specific purchase flow
    const mobilePurchaseFlow = PassesTestHelpers.getPurchaseFlow('mobile');
    
    const mobileSection = page.locator(mobilePurchaseFlow.section);
    if (await mobileSection.count() > 0) {
      await expect(mobileSection).toBeVisible();
      
      const totalPurchase = page.locator(mobilePurchaseFlow.total);
      if (await totalPurchase.count() > 0) {
        await totalPurchase.click();
      }
      
      const waiver = page.locator(mobilePurchaseFlow.waiver);
      if (await waiver.count() > 0) {
        await waiver.check();
        await page.locator(mobilePurchaseFlow.completeButton).click();
      }
    }
  });

  test('should test discount code functionality', async ({ page }) => {
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
    
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const trigger = page.locator(discountFlow.trigger);
    
    if (await trigger.count() > 0) {
      // Open discount form
      await trigger.click();
      
      // Test invalid code
      await page.locator(discountFlow.input).fill('INVALID');
      await page.locator(discountFlow.applyButton).click();
      
      // Wait for response and check message
      await page.waitForTimeout(2000);
      const message = page.locator(discountFlow.message);
      if (await message.count() > 0) {
        await expect(message).toBeVisible();
      }
      
      // Test valid code
      await page.locator(discountFlow.input).clear();
      await page.locator(discountFlow.input).fill('VALID123');
      await page.locator(discountFlow.applyButton).click();
      
      await page.waitForTimeout(2000);
      if (await message.count() > 0) {
        await expect(message).toBeVisible();
      }
    }
  });

  test('should test attendee-specific functionality', async ({ page }) => {
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
    
    const attendeeId = '2';
    const attendeeProducts = PassesTestHelpers.getAttendeeProducts(attendeeId);
    
    // Check attendee info
    const nameSelector = page.locator(PassesSelectors.attendeeTicket.name(attendeeId));
    const categorySelector = page.locator(PassesSelectors.attendeeTicket.category(attendeeId));
    
    if (await nameSelector.count() > 0) {
      await expect(nameSelector).toBeVisible();
    }
    
    if (await categorySelector.count() > 0) {
      await expect(categorySelector).toBeVisible();
    }
    
    // Test product groups
    const localTrigger = page.locator(attendeeProducts.localTrigger);
    if (await localTrigger.count() > 0) {
      await localTrigger.click();
      await expect(page.locator(PassesSelectors.attendeeTicket.localProductsContent(attendeeId))).toBeVisible();
    }
    
    const commonTrigger = page.locator(attendeeProducts.commonTrigger);
    if (await commonTrigger.count() > 0) {
      await commonTrigger.click();
      await expect(page.locator(PassesSelectors.attendeeTicket.commonProductsContent(attendeeId))).toBeVisible();
    }
  });

  test('should test total purchase details', async ({ page }) => {
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
    
    const totalFlow = PassesTestHelpers.getTotalPurchaseFlow();
    const trigger = page.locator(totalFlow.trigger);
    
    if (await trigger.count() > 0) {
      await trigger.click();
      
      // Check total display
      await expect(page.locator(totalFlow.finalTotal)).toBeVisible();
      
      // Check for discount information
      const discountAmount = page.locator(PassesSelectors.totalPurchase.discountAmount);
      if (await discountAmount.count() > 0) {
        await expect(discountAmount).toBeVisible();
      }
      
      // Check for original total (shows discount applied)
      const originalTotal = page.locator(totalFlow.originalTotal);
      if (await originalTotal.count() > 0) {
        await expect(originalTotal).toBeVisible();
      }
    }
  });

  test('should test responsive behavior', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 1280, height: 800 }  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      await page.locator(PassesSelectors.sidebar.passesButton).click();
      await page.locator(PassesSelectors.tabs.buyPassesTab).click();
      
      // Verify main components are visible
      await expect(page.locator(PassesSelectors.buyPasses.container)).toBeVisible();
      await expect(page.locator(PassesSelectors.buyPasses.attendeesContainer)).toBeVisible();
      
      // Check device-specific purchase sections
      if (viewport.width <= 768) {
        // Mobile
        const mobileSection = page.locator(PassesSelectors.purchase.mobileSection);
        if (await mobileSection.count() > 0) {
          await expect(mobileSection).toBeVisible();
        }
      } else {
        // Desktop
        const desktopSection = page.locator(PassesSelectors.purchase.desktopSection);
        if (await desktopSection.count() > 0) {
          await expect(desktopSection).toBeVisible();
        }
      }
    }
  });
});

// Helper functions for common test patterns
export const TestPatterns = {
  /**
   * Navigate to buy passes and wait for load
   */
  navigateToBuyPasses: async (page: any) => {
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
    await expect(page.locator(PassesSelectors.buyPasses.container)).toBeVisible();
  },

  /**
   * Apply a discount code if the functionality is available
   */
  applyDiscountCode: async (page: any, code: string) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const trigger = page.locator(discountFlow.trigger);
    
    if (await trigger.count() > 0) {
      await trigger.click();
      await page.locator(discountFlow.input).fill(code);
      await page.locator(discountFlow.applyButton).click();
      await page.waitForTimeout(2000);
      
      return await page.locator(discountFlow.message).count() > 0;
    }
    return false;
  },

  /**
   * Open total purchase details if available
   */
  openTotalPurchase: async (page: any) => {
    const totalFlow = PassesTestHelpers.getTotalPurchaseFlow();
    const trigger = page.locator(totalFlow.trigger);
    
    if (await trigger.count() > 0) {
      await trigger.click();
      return true;
    }
    return false;
  },

  /**
   * Complete purchase flow for a given device type
   */
  completePurchaseFlow: async (page: any, deviceType: 'mobile' | 'desktop' | 'static' = 'desktop') => {
    const purchaseFlow = PassesTestHelpers.getPurchaseFlow(deviceType);
    const section = page.locator(purchaseFlow.section);
    
    if (await section.count() > 0) {
      const waiver = page.locator(purchaseFlow.waiver);
      if (await waiver.count() > 0 && !(await waiver.isChecked())) {
        await waiver.check();
      }
      
      const completeButton = page.locator(purchaseFlow.completeButton);
      if (await completeButton.count() > 0 && await completeButton.isEnabled()) {
        await completeButton.click();
        return true;
      }
    }
    return false;
  }
};
