import { STORAGE_KEYS } from '@bypass/shared';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { expect, test, type BrowserContext } from '@playwright/test';

import { EExtStorageKey } from '@/constants';

import { removeStorageFromWorker } from '../fixtures/background-fixture';
import {
  createSharedBackgroundSW,
  getExtensionId,
  openExtensionPanelPage,
  withTempProfileContext,
} from '../fixtures/base-fixture';
import { getStorageItem } from '../utils/test-utils';

const GOOGLE_LOGOUT_TABS = [
  'https://www.google.com/',
  'https://www.google.com/imghp',
  'https://myactivity.google.com/activitycontrols/webandapp',
];

interface SignedInProfile {
  context: BrowserContext;
  extensionId: string;
  /** True if logout ever tried to write the shared account despite the guard. */
  sawAccountWrite: () => boolean;
}

/**
 * Logout is destructive, so each test gets its own copy of the authenticated
 * profile. The one remote write on the path is aborted rather than faked: a fake
 * success would let the guard rot unnoticed, and a real one would rewrite the
 * fixture data every other spec reads.
 */
const withSignedInProfile = async (
  headless: boolean,
  run: (profile: SignedInProfile) => Promise<void>
) =>
  withTempProfileContext(
    { prefix: 'chrome-auth-lifecycle-', headless, seedFromCachedProfile: true },
    async (context) => {
      let sawAccountWrite = false;
      // tRPC batches procedures into one request, so the url names only the first
      await context.route('**/api/trpc**', async (route) => {
        const request = route.request();
        if (
          request.url().includes('bookmarkAndPersonSave') ||
          (request.postData() ?? '').includes('bookmarkAndPersonSave')
        ) {
          sawAccountWrite = true;
          await route.abort();
          return;
        }
        await route.fallback();
      });
      for (const url of GOOGLE_LOGOUT_TABS) {
        await context.route(`${url}**`, async (route) => {
          await route.fulfill({ contentType: 'text/html', body: '' });
        });
      }

      const backgroundSW = await createSharedBackgroundSW(context);
      const extensionId = await getExtensionId(backgroundSW);
      // Nothing pending means pre-logout skips the shared account write entirely
      await removeStorageFromWorker(backgroundSW, [
        EExtStorageKey.HAS_PENDING_BOOKMARKS,
        EExtStorageKey.HAS_PENDING_PERSONS,
      ]);

      try {
        await run({
          context,
          extensionId,
          sawAccountWrite: () => sawAccountWrite,
        });
      } finally {
        // Soft, because throwing from a finally replaces whatever failure the
        // body was already reporting
        expect
          .soft(
            sawAccountWrite,
            'logout tried to write the shared test account'
          )
          .toBe(false);
      }
    }
  );

test.describe('Auth lifecycle', () => {
  test('clears synced storage and opens the account tabs on logout', async ({}, testInfo) => {
    await withSignedInProfile(
      testInfo.project.use?.headless ?? true,
      async ({ context, extensionId }) => {
        const page = await openExtensionPanelPage(context, extensionId, 'home');
        const tabsBefore = context.pages().length;

        await page.getByTestId('logout-button').click();

        await expect(page.getByTestId('login-button')).toBeVisible({
          timeout: TEST_TIMEOUTS.AUTH,
        });
        expect(
          await getStorageItem(page, STORAGE_KEYS.bookmarks)
        ).toBeUndefined();
        expect(
          await getStorageItem(page, STORAGE_KEYS.persons)
        ).toBeUndefined();
        expect(
          await getStorageItem(page, STORAGE_KEYS.redirections)
        ).toBeUndefined();
        await expect
          .poll(() => context.pages().length, {
            timeout: TEST_TIMEOUTS.PAGE_OPEN,
          })
          .toBe(tabsBefore + GOOGLE_LOGOUT_TABS.length);
      }
    );
  });

  test('signs out on its own when the extension is switched off', async ({}, testInfo) => {
    await withSignedInProfile(
      testInfo.project.use?.headless ?? true,
      async ({ context, extensionId }) => {
        const page = await openExtensionPanelPage(context, extensionId, 'home');

        await page.getByTestId('toggle-extension-switch').click();

        await expect(page.getByTestId('login-button')).toBeVisible({
          timeout: TEST_TIMEOUTS.AUTH,
        });
      }
    );
  });
});
