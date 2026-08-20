import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';

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
    const logoutButton = homePage.getByTestId('logout-button');
    await homeExpect(logoutButton).toBeVisible();

    const defaultsButton = homePage.getByTestId('open-defaults-button');
    await homeExpect(defaultsButton).toBeEnabled();

    const initialPageCount = context.pages().length;

    await defaultsButton.click();

    await homeExpect
      .poll(() => context.pages().length, {
        message: 'Should open 2 new tabs',
      })
      .toBe(initialPageCount + 2);

    const allPages = context.pages();
    const newPages = allPages.filter((p) => p !== homePage);

    await homeExpect
      .poll(
        () => {
          const currentPages = context
            .pages()
            .filter((page) => page !== homePage);

          return currentPages
            .map((page) => page.url())
            .filter(
              (url) =>
                url.startsWith('http') || url.startsWith('chrome-error://')
            )
            .map((url) => {
              if (url.startsWith('chrome-error://')) {
                return url;
              }

              const parsed = new URL(url);
              return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
            });
        },
        { timeout: 15_000 }
      )
      .toEqual(
        homeExpect.arrayContaining([
          'https://www.google.com/',
          homeExpect.stringMatching(/mantine\.dev|^chrome-error:\/\//),
        ])
      );

    for (const newPage of newPages) {
      await newPage.close();
    }
  });
});
