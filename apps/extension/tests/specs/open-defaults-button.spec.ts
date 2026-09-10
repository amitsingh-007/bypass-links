import { EStorageKey, type IRedirections } from '@bypass/shared';
import {
  TEST_DEFAULT_REDIRECTION_URLS,
  TEST_SITES,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { type Page } from '@playwright/test';

import {
  createSharedBackgroundSW,
  getExtensionId,
  openExtensionPanelPage,
  withTempProfileContext,
} from '../fixtures/base-fixture';
import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';
import { getRecordedTabs, recordCreatedTabs } from '../utils/test-utils';

/** Rewriting the rule list is destructive, so it happens on a throwaway copy. */
const withRedirections = async (
  redirections: IRedirections,
  run: (page: Page) => Promise<void>
) =>
  withTempProfileContext({ seedFromCachedProfile: true }, async (context) => {
    const backgroundSW = await createSharedBackgroundSW(context);
    const extensionId = await getExtensionId(backgroundSW);
    await backgroundSW.evaluate(
      async ({ key, rules }) => {
        await chrome.storage.local.set({ [key]: rules });
      },
      { key: EStorageKey.redirections, rules: redirections }
    );

    await run(await openExtensionPanelPage(context, extensionId));
  });

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

  test('skips rules that are incomplete or not default', async () => {
    const eligibleUrl = `${TEST_SITES.EXAMPLE_COM}/eligible`;
    await withRedirections(
      [
        { alias: 'e2e-eligible', website: btoa(eligibleUrl), isDefault: true },
        {
          alias: '',
          website: btoa(`${TEST_SITES.EXAMPLE_COM}/no-alias`),
          isDefault: true,
        },
        {
          alias: 'e2e-not-default',
          website: btoa(`${TEST_SITES.EXAMPLE_COM}/not-default`),
          isDefault: false,
        },
      ],
      async (page) => {
        await recordCreatedTabs(page);
        await page.getByTestId('open-defaults-button').click();

        await homeExpect
          .poll(() => getRecordedTabs(page), {
            timeout: TEST_TIMEOUTS.PAGE_OPEN,
          })
          .toEqual([{ url: eligibleUrl, active: false }]);
      }
    );
  });

  test('opens nothing when no rule qualifies', async () => {
    await withRedirections([], async (page) => {
      const defaultsButton = page.getByTestId('open-defaults-button');
      await defaultsButton.click();

      // Enabled again means the handler ran to completion, opening nothing
      await homeExpect(defaultsButton).toBeEnabled();
      // Read back from Chrome rather than the tab event log, which could still
      // be carrying an event for a tab already created
      const openedUrls = await page.evaluate(async () =>
        (await chrome.tabs.query({})).map((tab) => tab.pendingUrl ?? tab.url)
      );
      homeExpect(openedUrls.filter((url) => url?.startsWith('http'))).toEqual(
        []
      );
    });
  });
});
