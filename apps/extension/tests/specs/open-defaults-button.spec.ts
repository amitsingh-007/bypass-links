import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';

/**
 * OpenDefaultsButton E2E Tests
 *
 * Tests the OpenDefaultsButton component which opens all default websites
 * These tests run sequentially with shared browser context.
 */

test('should be disabled when not signed in', async ({ unauthPage }) => {
  const defaultsButton = unauthPage.getByTestId('open-defaults-button');
  await homeExpect(defaultsButton).toBeVisible();
  await homeExpect(defaultsButton).toBeDisabled();
});

test.describe.serial('Signed In', () => {
  test('should be enabled and open default tabs in background', async ({
    homePage,
    context,
  }) => {
    // Verify logged in state
    const logoutButton = homePage.getByTestId('logout-button');
    await homeExpect(logoutButton).toBeVisible();

    // Button should be enabled
    const defaultsButton = homePage.getByTestId('open-defaults-button');
    await homeExpect(defaultsButton).toBeEnabled();

    // Get initial page count before clicking
    const initialPageCount = context.pages().length;

    // Click the Defaults button
    await defaultsButton.click();

    // Poll for the expected number of pages to be opened (initial + 2 new tabs)
    await homeExpect
      .poll(() => context.pages().length, {
        timeout: TEST_TIMEOUTS.PAGE_OPEN,
        message: 'Should open 2 new tabs',
      })
      .toBe(initialPageCount + 2);

    const allPages = context.pages();
    const newPages = allPages.filter((p) => p !== homePage);

    // Get actual website URLs (filter out internal pages like about:blank)
    const urls = newPages
      .map((p) => p.url())
      .filter((url) => !url.startsWith('about:'));

    // Get base URLs without query params or hashes
    const baseUrls = urls.map((url) => {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    });

    // Verify 2 default tabs were opened (Google and Mantine)
    homeExpect(urls).toHaveLength(2);
    homeExpect(baseUrls).toContain('https://www.google.com/');
    homeExpect(baseUrls).toContain('https://mantine.dev/');

    // Clean up: close new tabs
    for (const newPage of newPages) {
      await newPage.close();
    }
  });
});
