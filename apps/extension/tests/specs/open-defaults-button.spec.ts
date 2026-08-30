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

    const initialPages = new Set(context.pages());
    const externalPages = /^https:\/\/(?:www\.google\.com|mantine\.dev)\//;
    await context.route(externalPages, async (route) => {
      await route.fulfill({ contentType: 'text/html', body: '' });
    });

    try {
      await defaultsButton.click();

      await homeExpect
        .poll(() => context.pages().length, {
          message: 'Should open 2 new tabs',
        })
        .toBe(initialPages.size + 2);

      await homeExpect
        .poll(
          () => {
            const currentPages = context
              .pages()
              .filter((page) => !initialPages.has(page));

            return currentPages
              .map((page) => page.url())
              .filter((url) => url.startsWith('http'))
              .map((url) => {
                const parsed = new URL(url);
                return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
              });
          },
          { timeout: 15_000 }
        )
        .toEqual(
          homeExpect.arrayContaining([
            'https://www.google.com/',
            'https://mantine.dev/',
          ])
        );
    } finally {
      try {
        await Promise.all(
          context
            .pages()
            .filter((page) => !initialPages.has(page))
            .map((page) => page.close())
        );
      } finally {
        await context.unroute(externalPages);
      }
    }
  });
});
