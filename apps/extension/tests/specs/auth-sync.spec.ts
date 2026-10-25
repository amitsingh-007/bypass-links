import { EStorageKey } from '@bypass/shared';
import {
  failProcedure,
  routeTrpcProcedure,
  succeedProcedure,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { expect, test, type Page } from '@playwright/test';

import {
  EExtensionState,
  EExtStorageKey,
  TEST_AUTH_DATA_KEY,
} from '@/constants';

import { writeStorageFromWorker } from '../fixtures/background-fixture';
import {
  abortAccountWrites,
  createSharedBackgroundSW,
  getExtensionId,
  getPopupUrl,
  openExtensionPanelPage,
  withTempProfileContext,
} from '../fixtures/base-fixture';
import { withSignedInProfile } from '../utils/signed-in-profile';
import { getStorageItem, useTestCredentials } from '../utils/test-utils';

const ACCOUNT_SAVE = 'firebaseData.bookmarkAndPersonSave';

test('rejects malformed injected auth data without signing in or consuming it', async () => {
  await withTempProfileContext({}, async (context) => {
    const extensionId = await getExtensionId(
      await createSharedBackgroundSW(context)
    );
    const page = await context.newPage();
    await page.goto(getPopupUrl(extensionId));
    const loginButton = page.getByTestId('login-button');
    await expect(loginButton).toBeEnabled();
    for (const raw of ['{', '{"uid":"invalid"}']) {
      await test.step(`rejects ${raw}`, async () => {
        await page.localStorage.setItem(TEST_AUTH_DATA_KEY, raw);
        await loginButton.click();
        await expect(loginButton).toBeEnabled();
        await expect(page.getByTestId('logout-button')).toHaveCount(0);
        expect(await page.localStorage.getItem(TEST_AUTH_DATA_KEY)).toBe(raw);
      });
    }
  });
});
const SYNCED_KEYS = [
  EStorageKey.bookmarks,
  EStorageKey.persons,
  EStorageKey.redirections,
  EStorageKey.lastVisited,
  EStorageKey.websites,
] as const;

const getCachedEntryCount = async (page: Page) =>
  page.evaluate(async () => {
    const buckets = await caches.keys();
    const counts = await Promise.all(
      buckets.map(async (bucket) => (await caches.open(bucket)).keys())
    );
    return counts.reduce((total, entries) => total + entries.length, 0);
  });

const PENDING_CASES = [
  { name: 'bookmark', bookmarks: true, persons: false },
  { name: 'person', bookmarks: false, persons: true },
  { name: 'bookmark and person', bookmarks: true, persons: true },
] as const;

test.describe('Pending changes on logout', () => {
  for (const pendingCase of PENDING_CASES) {
    test(`sends the local data when ${pendingCase.name} changes are pending`, async () => {
      await withSignedInProfile(
        async ({ context, extensionId, backgroundSW }) => {
          const saves = await routeTrpcProcedure(
            context,
            ACCOUNT_SAVE,
            async (call) => {
              await succeedProcedure(call, null);
            }
          );
          await writeStorageFromWorker(backgroundSW, {
            [EExtStorageKey.HAS_PENDING_BOOKMARKS]: pendingCase.bookmarks,
            [EExtStorageKey.HAS_PENDING_PERSONS]: pendingCase.persons,
          });

          const page = await openExtensionPanelPage(context, extensionId);
          // Read before the logout wipes them, so the payload has something to match
          const bookmarks = await getStorageItem(page, EStorageKey.bookmarks);
          const persons = await getStorageItem(page, EStorageKey.persons);

          await page.getByTestId('logout-button').click();
          await expect(page.getByTestId('login-button')).toBeVisible({
            timeout: TEST_TIMEOUTS.AUTH,
          });

          expect(saves()).toEqual([{ bookmarks, persons }]);
        },
        { keepPendingFlags: true }
      );
    });
  }

  test('clears the pending flags, owned storage and caches once the save lands', async () => {
    await withSignedInProfile(
      async ({ context, extensionId, backgroundSW }) => {
        await routeTrpcProcedure(context, ACCOUNT_SAVE, async (call) => {
          await succeedProcedure(call, null);
        });
        await writeStorageFromWorker(backgroundSW, {
          [EExtStorageKey.HAS_PENDING_BOOKMARKS]: true,
          [EExtStorageKey.HAS_PENDING_PERSONS]: true,
        });

        const page = await openExtensionPanelPage(context, extensionId);
        expect(await getCachedEntryCount(page)).toBeGreaterThan(0);

        await page.getByTestId('logout-button').click();
        await expect(page.getByTestId('login-button')).toBeVisible({
          timeout: TEST_TIMEOUTS.AUTH,
        });

        for (const key of SYNCED_KEYS) {
          expect(await getStorageItem(page, key), key).toBeUndefined();
        }
        expect(
          await getStorageItem(page, EExtStorageKey.HAS_PENDING_BOOKMARKS)
        ).toBeUndefined();
        expect(
          await getStorageItem(page, EExtStorageKey.HAS_PENDING_PERSONS)
        ).toBeUndefined();
        await expect.poll(() => getCachedEntryCount(page)).toBe(0);
      },
      { keepPendingFlags: true }
    );
  });

  test('keeps the session, the local data and the flags when the save fails', async () => {
    await withSignedInProfile(
      async ({ context, extensionId, backgroundSW }) => {
        let isFailing = true;
        await routeTrpcProcedure(context, ACCOUNT_SAVE, async (call) => {
          if (isFailing) {
            await failProcedure(call);
            return;
          }
          await succeedProcedure(call, null);
        });
        await writeStorageFromWorker(backgroundSW, {
          [EExtStorageKey.HAS_PENDING_BOOKMARKS]: true,
          [EExtStorageKey.HAS_PENDING_PERSONS]: true,
        });

        const page = await openExtensionPanelPage(context, extensionId);
        const bookmarksBefore = await getStorageItem(
          page,
          EStorageKey.bookmarks
        );

        await page.getByTestId('logout-button').click();

        await test.step('the failed save leaves everything in place', async () => {
          await expect(page.getByText('Error while logging out')).toBeVisible();
          await expect(page.getByTestId('logout-button')).toBeVisible();
          expect(await getStorageItem(page, EStorageKey.bookmarks)).toEqual(
            bookmarksBefore
          );
          expect(
            await getStorageItem(page, EExtStorageKey.HAS_PENDING_BOOKMARKS)
          ).toBe(true);
          expect(
            await getStorageItem(page, EExtStorageKey.HAS_PENDING_PERSONS)
          ).toBe(true);
        });

        await test.step('retrying logs out and clears the flags', async () => {
          isFailing = false;
          await page.getByTestId('logout-button').click();

          await expect(page.getByTestId('login-button')).toBeVisible({
            timeout: TEST_TIMEOUTS.AUTH,
          });
          expect(
            await getStorageItem(page, EExtStorageKey.HAS_PENDING_BOOKMARKS)
          ).toBeUndefined();
          expect(
            await getStorageItem(page, EExtStorageKey.HAS_PENDING_PERSONS)
          ).toBeUndefined();
        });
      },
      { keepPendingFlags: true }
    );
  });

  test('switch-off waits for saving and preserves the session and edits until a retry succeeds', async () => {
    await withSignedInProfile(
      async ({ context, extensionId, backgroundSW }) => {
        let releaseSave: (() => void) | undefined;
        const pendingSave = new Promise<void>((resolve) => {
          releaseSave = resolve;
        });
        let isFailing = true;
        const saves = await routeTrpcProcedure(
          context,
          ACCOUNT_SAVE,
          async (call) => {
            await pendingSave;
            if (isFailing) {
              await failProcedure(call);
              return;
            }
            await succeedProcedure(call, null);
          }
        );
        await writeStorageFromWorker(backgroundSW, {
          [EExtStorageKey.HAS_PENDING_BOOKMARKS]: true,
          [EExtStorageKey.HAS_PENDING_PERSONS]: true,
        });
        const page = await openExtensionPanelPage(context, extensionId);
        const bookmarks = await getStorageItem(page, EStorageKey.bookmarks);
        const persons = await getStorageItem(page, EStorageKey.persons);
        const cachedEntries = await getCachedEntryCount(page);
        const tabsBefore = context.pages().length;
        const extensionSwitch = page.getByTestId('toggle-extension-switch');

        try {
          await extensionSwitch.click();
          await expect.poll(saves).toEqual([{ bookmarks, persons }]);
          await expect(extensionSwitch).toBeChecked();
          await expect(extensionSwitch).toBeDisabled();
          await expect(page.getByTestId('logout-button')).toBeDisabled();
          await expect(page.getByTestId('loading-overlay')).toBeVisible();
        } finally {
          releaseSave?.();
        }

        await expect(page.getByText('Error while logging out')).toBeVisible();
        await expect(extensionSwitch).toBeEnabled();
        await expect(extensionSwitch).toBeChecked();
        await expect(page.getByTestId('logout-button')).toBeEnabled();
        expect(await getStorageItem(page, EExtStorageKey.EXT_STATE)).toBe(
          EExtensionState.ACTIVE
        );
        expect(await getStorageItem(page, EStorageKey.bookmarks)).toEqual(
          bookmarks
        );
        expect(await getStorageItem(page, EStorageKey.persons)).toEqual(
          persons
        );
        for (const key of [
          EExtStorageKey.HAS_PENDING_BOOKMARKS,
          EExtStorageKey.HAS_PENDING_PERSONS,
        ]) {
          expect(await getStorageItem(page, key)).toBe(true);
        }
        expect(await getCachedEntryCount(page)).toBe(cachedEntries);
        expect(context.pages()).toHaveLength(tabsBefore);

        isFailing = false;
        await extensionSwitch.click();
        await expect(extensionSwitch).not.toBeChecked();
        await expect(page.getByTestId('login-button')).toBeDisabled();
        expect(saves()).toEqual([
          { bookmarks, persons },
          { bookmarks, persons },
        ]);
        expect(await getStorageItem(page, EExtStorageKey.EXT_STATE)).toBe(
          EExtensionState.INACTIVE
        );
        for (const key of [
          ...SYNCED_KEYS,
          EExtStorageKey.HAS_PENDING_BOOKMARKS,
          EExtStorageKey.HAS_PENDING_PERSONS,
        ]) {
          expect(await getStorageItem(page, key), key).toBeUndefined();
        }
        await expect.poll(() => getCachedEntryCount(page)).toBe(0);
        await expect(page.getByTestId('loading-overlay')).toHaveCount(0);
      },
      { keepPendingFlags: true }
    );
  });
});

test('a partly failed login sync leaves a clean signed-out popup', async () => {
  await withTempProfileContext({}, async (context) => {
    const sawAccountWrite = await abortAccountWrites(context);
    await useTestCredentials(context);
    const batchedUrls: string[] = [];
    const failedCalls = await routeTrpcProcedure(
      context,
      'firebaseData.personsGet',
      async (call) => {
        batchedUrls.push(call.route.request().url());
        await failProcedure(call);
      }
    );

    const extensionId = await getExtensionId(
      await createSharedBackgroundSW(context)
    );
    const page = await context.newPage();
    await page.goto(getPopupUrl(extensionId), {
      waitUntil: 'domcontentloaded',
    });
    await page.getByTestId('login-button').click();

    await expect
      .poll(failedCalls, { timeout: TEST_TIMEOUTS.AUTH })
      .not.toHaveLength(0);
    await expect(page.getByTestId('login-button')).toBeVisible({
      timeout: TEST_TIMEOUTS.AUTH,
    });
    expect(
      batchedUrls.join('\n'),
      'the failure has to be partial, so its batch must carry other procedures'
    ).toContain('bookmarksGet');
    for (const key of SYNCED_KEYS) {
      expect(await getStorageItem(page, key), key).toBeUndefined();
    }
    expect(sawAccountWrite(), 'the revert wrote the shared account').toBe(
      false
    );
  });
});
