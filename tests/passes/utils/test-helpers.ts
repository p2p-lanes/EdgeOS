/**
 * Shared utilities and fixtures for Passes tests
 */

import { Page } from '@playwright/test';

export class PassesPage {
  constructor(private page: Page) {}

  /**
   * Navigate to the passes section with authentication
   */
  async navigateWithAuth(tokenUrl: string) {
    await this.page.goto(`/auth?token_url=${tokenUrl}`);
    await this.page.waitForURL('**/portal/**');
    
    // Navigate to passes section
    await this.page.getByRole('button', { name: 'Passes' }).click();
  }

  /**
   * Switch to Buy Passes tab
   */
  async goToBuyPasses() {
    await this.page.locator('[data-testid="buy-passes-tab"]').click();
  }

  /**
   * Switch to Your Passes tab
   */
  async goToYourPasses() {
    await this.page.locator('[data-testid="your-passes-tab"]').click();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad() {
    await this.page.locator('[data-testid="buy-passes-container"]').waitFor();
  }
}

export const TestTokens = {
  // Sample authentication token (replace with actual test tokens)
  VALID_USER: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3BvcnRhbGRldi5zaW1wbGVmaS50ZWNoL2NpdGl6ZW5zL2xvZ2luP2VtYWlsPWpvZWwlNDBtdXZpbmFpLmNvbSZzcGljZT1xbDF2SUJyYXdnalIiLCJjaXRpemVuX2VtYWlsIjoiam9lbEBtdXZpbmFpLmNvbSIsImNpdGl6ZW5faWQiOjIsImlhdCI6MTc1OTQzMjc4OSwiZXhwIjoxNzU5NDQzNTg5fQ.-FhKts9fx_RzduZSLjFwFYakKgOVkitM-me2GttZ13o',
  
  // Add more test tokens as needed
  // PREMIUM_USER: 'premium-user-token-here',
  // LOCAL_RESIDENT: 'local-resident-token-here'
};

export const TestData = {
  discountCodes: {
    VALID: 'TESTVALID123',
    INVALID: 'INVALID999',
    EXPIRED: 'EXPIRED2023',
  },
  
  attendeeIds: {
    MAIN: '1',
    SPOUSE: '2',
    CHILD: '3'
  },

  productIds: {
    WEEKEND_DAY: 'weekend-day-1',
    WEEKDAY: 'weekday-single',
    WEEK_2: 'week-2',
    MONTH_SPOUSE: 'month-spouse'
  }
};

export const TestHelpers = {
  /**
   * Take a screenshot with a descriptive filename
   */
  takeScreenshot: async (page: Page, testName: string, suffix: string = '') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tests/passes/screenshots/${testName}-${suffix}-${timestamp}.png`;
    await page.screenshot({ path: filename, fullPage: true });
  },

  /**
   * Wait for network idle (useful for dynamic content)
   */
  waitForNetworkIdle: async (page: Page, timeout: number = 2000) => {
    await page.waitForLoadState('networkidle', { timeout });
  },

  /**
   * Check if element exists without throwing error
   */
  elementExists: async (page: Page, selector: string): Promise<boolean> => {
    return (await page.locator(selector).count()) > 0;
  },

  /**
   * Fill form field if it exists
   */
  fillIfExists: async (page: Page, selector: string, value: string): Promise<boolean> => {
    if (await TestHelpers.elementExists(page, selector)) {
      await page.locator(selector).fill(value);
      return true;
    }
    return false;
  },

  /**
   * Click element if it exists and is enabled
   */
  clickIfExists: async (page: Page, selector: string): Promise<boolean> => {
    const element = page.locator(selector);
    if (await element.count() > 0 && await element.isEnabled()) {
      await element.click();
      return true;
    }
    return false;
  }
};
