import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';

/**
 * OpenDefaultsButton E2E Tests
 *
 * Tests the OpenDefaultsButton component which opens all default websites
 * These tests run sequentially with shared browser context.
 */

test('should be disabled when not signed in', async ({ unauthPage }) => {
  const defaultsButton = unauthPage.getByRole('button', { name: 'Defaults' });
  await homeExpect(defaultsButton).toBeVisible();
  await homeExpect(defaultsButton).toBeDisabled();
});

test.describe.serial('Signed In', () => {
  test('should be enabled and open default tabs in background', async ({
    homePage,
    context,
  }) => {
    // Verify logged in state
    const logoutButton = homePage.getByRole('button', { name: 'Logout' });
    await homeExpect(logoutButton).toBeVisible();

    // Button should be enabled
    const defaultsButton = homePage.getByRole('button', { name: 'Defaults' });
    await homeExpect(defaultsButton).toBeEnabled();

    // Click the Defaults button
    await defaultsButton.click();

    // Wait a moment for tabs to open, then check
    await homePage.waitForTimeout(2000);

    const allPages = context.pages();
    const newPages = allPages.filter((p) => p !== homePage);

    // Get actual website URLs (filter out internal pages like about:blank)
    const urls = newPages
      .map((p) => p.url())
      .filter((url) => !url.startsWith('about:'));

    // Verify 2 default tabs were opened (Google and Twitch)
    homeExpect(urls).toHaveLength(2);
    homeExpect(urls).toContain('https://www.google.com/');
    homeExpect(urls).toContain('https://www.twitch.tv/');

    // Clean up: close new tabs
    for (const newPage of newPages) {
      await newPage.close();
    }
  });
});
