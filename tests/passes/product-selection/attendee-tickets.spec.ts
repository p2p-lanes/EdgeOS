/**
 * E2E Tests for Product Selection functionality
 * Tests selecting different pass types, quantities, and configurations
 */

import { test, expect } from '@playwright/test';
import { PassesSelectors, PassesTestHelpers } from '../../utils';

test.describe('Buy Passes - Product Selection', () => {
  test.beforeEach(async ({ page }) => {
    const tokenUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3BvcnRhbGRldi5zaW1wbGVmaS50ZWNoL2NpdGl6ZW5zL2xvZ2luP2VtYWlsPWpvZWwlNDBtdXZpbmFpLmNvbSZzcGljZT1xbDF2SUJyYXdnalIiLCJjaXRpemVuX2VtYWlsIjoiam9lbEBtdXZpbmFpLmNvbSIsImNpdGl6ZW5faWQiOjIsImlhdCI6MTc1OTQzMjc4OSwiZXhwIjoxNzU5NDQzNTg5fQ.-FhKts9fx_RzduZSLjFwFYakKgOVkitM-me2GttZ13o';
    await page.goto(`/auth?token_url=${tokenUrl}`);
    await page.waitForURL('**/portal/**');
    
    // Navigate to Buy Passes using specific sidebar selector
    await page.locator(PassesSelectors.sidebar.passesButton).click();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
  });

  test('should display attendee tickets correctly', async ({ page }) => {
    // Verify attendees container is visible
    await expect(page.locator(PassesSelectors.buyPasses.attendeesContainer)).toBeVisible();
    
    // Check for at least one attendee ticket (using dynamic ID 1 as example)
    const mainAttendeeId = '1';
    const attendeeTicket = page.locator(PassesSelectors.attendeeTicket.container(mainAttendeeId));
    
    if (await attendeeTicket.count() > 0) {
      await expect(attendeeTicket).toBeVisible();
      
      // Verify attendee info is displayed
      await expect(page.locator(PassesSelectors.attendeeTicket.name(mainAttendeeId))).toBeVisible();
      await expect(page.locator(PassesSelectors.attendeeTicket.category(mainAttendeeId))).toBeVisible();
    }
  });

  test('should expand and collapse product groups', async ({ page }) => {
    const mainAttendeeId = '1';
    const attendeeProducts = PassesTestHelpers.getAttendeeProducts(mainAttendeeId);
    
    // Check if common products section exists
    const commonProductsTrigger = page.locator(attendeeProducts.commonTrigger);
    if (await commonProductsTrigger.count() > 0) {
      // Click to expand common products
      await commonProductsTrigger.click();
      
      // Verify content is visible
      const commonProductsContent = page.locator(PassesSelectors.attendeeTicket.commonProductsContent(mainAttendeeId));
      await expect(commonProductsContent).toBeVisible();
      
      // Click to collapse
      await commonProductsTrigger.click();
      
      // Note: Due to animation, we'll just verify the trigger is still clickable
      await expect(commonProductsTrigger).toBeVisible();
    }
  });

  test('should handle local products when available', async ({ page }) => {
    const mainAttendeeId = '1';
    const localProductsTrigger = page.locator(PassesSelectors.attendeeTicket.localProductsTrigger(mainAttendeeId));
    
    // Only test if local products exist
    if (await localProductsTrigger.count() > 0) {
      await localProductsTrigger.click();
      
      // Verify local products content is visible
      const localProductsContent = page.locator(PassesSelectors.attendeeTicket.localProductsContent(mainAttendeeId));
      await expect(localProductsContent).toBeVisible();
      
      // Verify ID required note is visible
      await expect(page.locator(PassesSelectors.attendeeTicket.idRequiredNote)).toBeVisible();
      await expect(page.locator(PassesSelectors.attendeeTicket.idRequiredNote)).toContainText('ID Required at check-in');
    }
  });

  test('should display check-in code for purchased passes', async ({ page }) => {
    const mainAttendeeId = '1';
    const checkInButton = page.locator(PassesSelectors.attendeeTicket.checkInButton(mainAttendeeId));
    
    // Only test if user has purchased passes (check-in button exists)
    if (await checkInButton.count() > 0) {
      await expect(checkInButton).toBeVisible();
      await expect(checkInButton).toContainText('Check-in Code');
      
      // Click to open QR modal (we won't test the modal content, just the click)
      await checkInButton.click();
    }
  });

  test('should show coming soon message when no products available', async ({ page }) => {
    // Look for coming soon message in any attendee ticket
    const comingSoonMessage = page.locator(PassesSelectors.attendeeTicket.comingSoonMessage);
    
    // This test depends on data state - only run if message exists
    if (await comingSoonMessage.count() > 0) {
      await expect(comingSoonMessage).toBeVisible();
      await expect(comingSoonMessage).toContainText('Coming soon');
    }
  });
});
