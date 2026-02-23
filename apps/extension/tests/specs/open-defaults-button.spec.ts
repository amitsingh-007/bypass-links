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

test.describe('Signed In', () => {
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
        message: 'Should open 2 new tabs',
      })
      .toBe(initialPageCount + 2);

    const allPages = context.pages();
    const newPages = allPages.filter((p) => p !== homePage);

    // Verify default tabs were opened (Google and Mantine)
    await homeExpect
      .poll(
        () => {
          const currentPages = context
            .pages()
            .filter((page) => page !== homePage);
          return currentPages
            .map((page) => page.url())
            .filter((url) => url.startsWith('http'))
            .map((url) => {
              const parsed = new URL(url);
              return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
            });
        },
        {
          timeout: 15_000,
        }
      )
      .toEqual(homeExpect.arrayContaining(['https://www.google.com/']));

    const baseUrls = context
      .pages()
      .filter((page) => page !== homePage)
      .map((page) => page.url())
      .filter(
        (url) => url.startsWith('http') || url.startsWith('chrome-error://')
      );
    homeExpect(baseUrls).toEqual(
      homeExpect.arrayContaining([
        homeExpect.stringMatching(/mantine\.dev|^chrome-error:\/\//),
      ])
    );

    // Clean up: close new tabs
    for (const newPage of newPages) {
      await newPage.close();
    }
  });
});
