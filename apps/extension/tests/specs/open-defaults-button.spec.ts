import {
  TEST_DEFAULT_REDIRECTION_URLS,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';

import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';
import { getRecordedTabs, recordCreatedTabs } from '../utils/test-utils';

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

    const pagesBefore = new Set(context.pages());

    try {
      await recordCreatedTabs(homePage);
      await defaultsButton.click();

      // Recorded at tabs.onCreated because both destinations redirect
      await homeExpect
        .poll(() => getRecordedTabs(homePage), {
          timeout: TEST_TIMEOUTS.PAGE_OPEN,
          message: 'Both default rules should open, in rule order',
        })
        .toEqual(
          TEST_DEFAULT_REDIRECTION_URLS.map((url) => ({ url, active: false }))
        );
    } finally {
      await Promise.all(
        context
          .pages()
          .filter((page) => !pagesBefore.has(page))
          .map((page) => page.close())
      );
    }
  });
});
