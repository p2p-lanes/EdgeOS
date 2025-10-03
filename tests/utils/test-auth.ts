/**
 * Test environment setup and token management
 */

// Test tokens - replace with valid tokens from your test environment
export const TestTokens = {
  // This should be a valid token with an accepted application
  VALID_ACCEPTED_USER: process.env.TEST_TOKEN_URL || 'your-valid-token-here',
  
  // This should be a token with a pending/not accepted application
  PENDING_USER: process.env.TEST_TOKEN_PENDING || 'your-pending-token-here'
};

export const TestEnv = {
  isTestingEnabled: () => !!process.env.TEST_TOKEN_URL,
  
  skipIfNoAuth: (test: any) => {
    if (!TestTokens.VALID_ACCEPTED_USER || TestTokens.VALID_ACCEPTED_USER.includes('your-valid-token-here')) {
      test.skip(true, 'No valid test token available. Set TEST_TOKEN_URL environment variable.');
    }
  }
};

export const createTestSetup = (tokenType: keyof typeof TestTokens = 'VALID_ACCEPTED_USER') => {
  return async (page: any) => {
    const tokenUrl = TestTokens[tokenType];
    
    if (!tokenUrl || tokenUrl.includes('your-valid-token-here')) {
      throw new Error(`No valid token for ${tokenType}. Please set environment variables.`);  
    }
    
    await page.goto(`/auth?token_url=${tokenUrl}`);
    await page.waitForURL('**/portal/**', { timeout: 10000 });
  };
};
