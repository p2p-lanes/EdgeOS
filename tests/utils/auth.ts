import { Page } from '@playwright/test';
import { 
  AUTH_EMAIL_TEST_PASSESS_TOKEN, 
  AUTH_EMAIL_TEST_APPLICATION_TOKEN 
} from './constants';

export interface AuthOptions {
  token?: string;
  baseUrl?: string;
  waitForLocalStorage?: boolean;
  timeout?: number;
}

export const AUTH_TOKENS = {
  PASSES: AUTH_EMAIL_TEST_PASSESS_TOKEN,
  APPLICATION: AUTH_EMAIL_TEST_APPLICATION_TOKEN,
} as const;

/**
 * Authenticates a test user by navigating to the auth page with a token_url parameter
 * @param page - Playwright Page instance
 * @param options - Authentication options
 * @returns Promise<void>
 */
export const authenticateWithToken = async (
  page: Page,
  options: AuthOptions = {}
): Promise<void> => {
  const {
    token = AUTH_EMAIL_TEST_PASSESS_TOKEN,
    baseUrl = 'http://localhost:3000',
    waitForLocalStorage = true,
    timeout = 10000,
  } = options;

  // Navigate to auth page with token_url parameter
  const authUrl = `${baseUrl}/auth?token_url=${encodeURIComponent(token)}`;
  await page.goto(authUrl);

  // Wait for authentication to complete by checking localStorage
  if (waitForLocalStorage) {
    await page.waitForFunction(
      () => {
        const token = window.localStorage.getItem('token');
        return token !== null && token !== '';
      },
      { timeout }
    );
  }

  // Optional: Wait for navigation to portal or success indicator
  await page.waitForURL(/\/portal/, { timeout, waitUntil: 'networkidle' }).catch(() => {
    // If it doesn't redirect to portal, that's okay
    console.log('Did not redirect to portal, continuing...');
  });
};

/**
 * Authenticates using the PASSES test token
 */
export const authenticateAsPassesUser = async (page: Page, baseUrl?: string): Promise<void> => {
  await authenticateWithToken(page, {
    token: AUTH_TOKENS.PASSES,
    baseUrl,
  });
};

/**
 * Authenticates using the APPLICATION test token
 */
export const authenticateAsApplicationUser = async (page: Page, baseUrl?: string): Promise<void> => {
  await authenticateWithToken(page, {
    token: AUTH_TOKENS.APPLICATION,
    baseUrl,
  });
};

/**
 * Clears authentication by removing the token from localStorage
 */
export const clearAuth = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    window.localStorage.removeItem('token');
  });
};

/**
 * Checks if the user is currently authenticated
 */
export const isAuthenticated = async (page: Page): Promise<boolean> => {
  return await page.evaluate(() => {
    const token = window.localStorage.getItem('token');
    return token !== null && token !== '';
  });
};

/**
 * Gets the current auth token from localStorage
 */
export const getAuthToken = async (page: Page): Promise<string | null> => {
  return await page.evaluate(() => {
    return window.localStorage.getItem('token');
  });
};

