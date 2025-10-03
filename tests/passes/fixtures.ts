/**
 * Global setup and configuration for Passes tests
 * This file is automatically loaded by Playwright
 */

import { test as base, expect } from '@playwright/test';
import { PassesPage, TestTokens } from './utils/test-helpers';

// Extend base test with custom fixtures
type PassesFixtures = {
  passesPage: PassesPage;
};

// Create extended test with fixtures
export const test = base.extend<PassesFixtures>({
  passesPage: async ({ page }, use) => {
    const passesPage = new PassesPage(page);
    await use(passesPage);
  }
});

export { expect };

// Global test configuration for passes
export const PassesTestConfig = {
  // Default timeout for tests
  timeout: 30000,
  
  // Default authentication token
  defaultToken: TestTokens.VALID_USER,
  
  // Screenshots directory
  screenshotsDir: 'tests/passes/screenshots/',
  
  // Common test data
  testData: {
    timeout: {
      short: 2000,
      medium: 5000,
      long: 10000
    },
    
    retries: {
      flaky: 2,
      stable: 0
    }
  }
};

// Common test patterns that can be reused
export const CommonPatterns = {
  /**
   * Standard setup for most passes tests
   */
  setupPassesTest: async (passesPage: PassesPage, tokenUrl?: string) => {
    const token = tokenUrl || PassesTestConfig.defaultToken;
    await passesPage.navigateWithAuth(token);
    await passesPage.goToBuyPasses();
    await passesPage.waitForLoad();
  },

  /**
   * Verify basic page structure
   */
  verifyBasicStructure: async (page: any) => {
    await expect(page.locator('[data-testid="passes-tabs"]')).toBeVisible();
    await expect(page.locator('[data-testid="buy-passes-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="attendees-container"]')).toBeVisible();
  }
};
