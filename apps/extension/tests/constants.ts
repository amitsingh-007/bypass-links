/**
 * LocalStorage key used to inject test auth data during Playwright tests.
 * This is read by the Firebase store to bypass the normal auth flow.
 */
export const TEST_AUTH_DATA_KEY = '__test_auth_data';
