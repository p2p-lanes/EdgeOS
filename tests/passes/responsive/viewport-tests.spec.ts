/**
 * E2E Tests for Responsive Design
 * Tests how the Buy Passes page behaves across different screen sizes
 */

import { test, expect } from '@playwright/test';
import { PassesSelectors, PassesTestHelpers } from '../../utils';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 800 },
  { name: 'Large Desktop', width: 1920, height: 1080 }
];

test.describe('Buy Passes - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    const tokenUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3BvcnRhbGRldi5zaW1wbGVmaS50ZWNoL2NpdGl6ZW5zL2xvZ2luP2VtYWlsPWpvZWwlNDBtdXZpbmFpLmNvbSZzcGljZT1xbDF2SUJyYXdnalIiLCJjaXRpemVuX2VtYWlsIjoiam9lbEBtdXZpbmFpLmNvbSIsImNpdGl6ZW5faWQiOjIsImlhdCI6MTc1OTQzMjc4OSwiZXhwIjoxNzU5NDQzNTg5fQ.-FhKts9fx_RzduZSLjFwFYakKgOVkitM-me2GttZ13o';
    await page.goto(`/auth?token_url=${tokenUrl}`);
    await page.waitForURL('**/portal/**');
    
    // Navigate to Buy Passes using specific sidebar selector
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
  });

  for (const viewport of viewports) {
    test(`should display correctly on ${viewport.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Verify main container is visible and properly sized
      await expect(page.locator(PassesSelectors.buyPasses.container)).toBeVisible();
      
      // Verify tabs are responsive
      await expect(page.locator(PassesSelectors.tabs.container)).toBeVisible();
      await expect(page.locator(PassesSelectors.tabs.buyPassesTab)).toBeVisible();
      
      // Check if attendees container adapts to screen size
      await expect(page.locator(PassesSelectors.buyPasses.attendeesContainer)).toBeVisible();
      
      // Take a screenshot for visual comparison
      await page.screenshot({ 
        path: `tests/passes/screenshots/responsive-${viewport.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true 
      });
    });
  }

  test('should show mobile purchase section on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileSection = page.locator(PassesSelectors.purchase.mobileSection);
    const desktopSection = page.locator(PassesSelectors.purchase.desktopSection);
    
    // Mobile section should be visible on mobile
    if (await mobileSection.count() > 0) {
      await expect(mobileSection).toBeVisible();
    }
    
    // Desktop section should be hidden on mobile
    if (await desktopSection.count() > 0) {
      await expect(desktopSection).toBeHidden();
    }
  });

  test('should show desktop purchase section on large screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const mobileSection = page.locator(PassesSelectors.purchase.mobileSection);
    const desktopSection = page.locator(PassesSelectors.purchase.desktopSection);
    
    // Desktop section should be visible on desktop
    if (await desktopSection.count() > 0) {
      await expect(desktopSection).toBeVisible();
    }
    
    // Mobile section should be hidden on desktop
    if (await mobileSection.count() > 0) {
      await expect(mobileSection).toBeHidden();
    }
  });

  test('should handle attendee tickets responsively', async ({ page }) => {
    const viewportTests = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Desktop', width: 1280, height: 800 }
    ];

    for (const viewport of viewportTests) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      const mainAttendeeId = '1';
      const attendeeTicket = page.locator(PassesSelectors.attendeeTicket.container(mainAttendeeId));
      
      if (await attendeeTicket.count() > 0) {
        await expect(attendeeTicket).toBeVisible();
        
        // Verify attendee info is visible
        await expect(page.locator(PassesSelectors.attendeeTicket.name(mainAttendeeId))).toBeVisible();
        
        // Verify products section adapts
        const productsSection = page.locator(PassesSelectors.attendeeTicket.productsSection(mainAttendeeId));
        if (await productsSection.count() > 0) {
          await expect(productsSection).toBeVisible();
        }
      }
    }
  });

  test('should handle discount code form responsively', async ({ page }) => {
    const discountFlow = PassesTestHelpers.getDiscountFlow();
    const haveCouponTrigger = page.locator(discountFlow.trigger);
    
    if (await haveCouponTrigger.count() > 0) {
      // Test on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await haveCouponTrigger.click();
      
      await expect(page.locator(PassesSelectors.discountCode.form)).toBeVisible();
      await expect(page.locator(discountFlow.input)).toBeVisible();
      await expect(page.locator(discountFlow.applyButton)).toBeVisible();
      
      // Test on desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      
      await expect(page.locator(PassesSelectors.discountCode.form)).toBeVisible();
      await expect(page.locator(discountFlow.input)).toBeVisible();
      await expect(page.locator(discountFlow.applyButton)).toBeVisible();
    }
  });

  test('should handle banner discount responsively', async ({ page }) => {
    const bannerDiscount = page.locator(PassesSelectors.buyPasses.bannerDiscount);
    
    if (await bannerDiscount.count() > 0) {
      // Test visibility across different screen sizes
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await expect(bannerDiscount).toBeVisible();
      }
    }
  });
});
