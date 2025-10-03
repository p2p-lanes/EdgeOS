/**
 * E2E Tests for Buy Passes Tab Navigation
 * Tests the main tab functionality and basic page structure
 */

import { test, expect } from '@playwright/test';
import { PassesSelectors, PassesTestHelpers } from '../../utils';

test.describe('Buy Passes - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the passes page with authentication token
    const tokenUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3BvcnRhbGRldi5zaW1wbGVmaS50ZWNoL2NpdGl6ZW5zL2xvZ2luP2VtYWlsPWpvZWwlNDBtdXZpbmFpLmNvbSZzcGljZT1xbDF2SUJyYXdnalIiLCJjaXRpemVuX2VtYWlsIjoiam9lbEBtdXZpbmFpLmNvbSIsImNpdGl6ZW5faWQiOjIsImlhdCI6MTc1OTQzMjc4OSwiZXhwIjoxNzU5NDQzNTQ5fQ.-FhKts9fx_RzduZSLjFwFYakKgOVkitM-me2GttZ13o';
    await page.goto(`/auth?token_url=${tokenUrl}`);
    
    // Wait for navigation to complete
    await page.waitForURL('**/portal/**');
  });

  test('should verify application is accepted and passes button is enabled', async ({ page }) => {
    // Check application status first
    const passesButton = page.locator(PassesSelectors.sidebar.passesButton);
    
    // Verify the button exists and is enabled
    await expect(passesButton).toBeVisible();
    await expect(passesButton).toBeEnabled();
    
    // Verify it contains the expected text
    await expect(passesButton).toContainText('Passes');
  });

  test('should display passes tabs correctly', async ({ page }) => {
    // Navigate to passes section using robust helper
    await PassesTestHelpers.navigateToBuyPasses(page);
    
    // We're already on the passes page, so verify both tabs are present
    await expect(page.locator(PassesSelectors.tabs.yourPassesTab)).toBeVisible();
    await expect(page.locator(PassesSelectors.tabs.buyPassesTab)).toBeVisible();
    
    // Verify tabs contain expected text
    await expect(page.locator(PassesSelectors.tabs.yourPassesTab)).toContainText('Your Passes');
    await expect(page.locator(PassesSelectors.tabs.buyPassesTab)).toContainText('Buy Passes');
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    // Navigate to passes section using robust helper (starts on Buy Passes)
    await PassesTestHelpers.navigateToBuyPasses(page);
    
    // Verify Buy Passes content is visible
    await expect(page.locator(PassesSelectors.buyPasses.container)).toBeVisible();
    await expect(page.locator(PassesSelectors.buyPasses.title)).toContainText('Buy Passes');
    
    // Click on Your Passes tab
    await page.locator(PassesSelectors.tabs.yourPassesTab).click();
    
    // Verify Your Passes content is visible
    await expect(page.locator(PassesSelectors.tabs.yourPassesContent)).toBeVisible();
  });

  test('should load Buy Passes page components', async ({ page }) => {
    // Navigate to passes section using robust helper
    await PassesTestHelpers.navigateToBuyPasses(page);
    
    // Verify main components are present (already verified in helper)
    await expect(page.locator(PassesSelectors.buyPasses.title)).toBeVisible();
    await expect(page.locator(PassesSelectors.buyPasses.toolbarContainer)).toBeVisible();
    await expect(page.locator(PassesSelectors.buyPasses.attendeesContainer)).toBeVisible();
  });
});
