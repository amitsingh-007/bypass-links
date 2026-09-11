import { ECacheBucketKeys, EStorageKey } from '@bypass/shared';
import {
  failProcedure,
  routeTrpcProcedure,
  TEST_BOOKMARKS,
  TEST_PERSONS,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { type Page } from '@playwright/test';

import { test, expect } from '../fixtures/base-fixture';
import { BookmarksPanel } from '../page-object-models/bookmarks-panel';
import { PersonsPanel } from '../page-object-models/persons-panel';
import { useTestCredentials } from '../utils/test-credentials';

const SYNCED_KEYS = [
  EStorageKey.bookmarks,
  EStorageKey.persons,
  EStorageKey.personImageUrls,
];
const SYNCED_CACHES = [ECacheBucketKeys.favicon, ECacheBucketKeys.person];

const presentSyncedKeys = async (page: Page) =>
  (await page.localStorage.items())
    .map(({ name }) => name)
    .filter((name) => SYNCED_KEYS.includes(name as EStorageKey));

const cacheNames = async (page: Page) =>
  page.evaluate(() => caches.keys().then((keys) => keys.toSorted()));

/** The button is briefly "Logout" and enabled before the preload starts, so use the spinner. */
const expectLoadingEnded = async (page: Page) => {
  await expect(page.getByRole('button', { name: 'Logout' })).toBeEnabled();
  await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
};

const signIn = async (page: Page) => {
  await page.getByRole('button', { name: 'Login' }).click();
  await expect
    .poll(() => presentSyncedKeys(page), { timeout: TEST_TIMEOUTS.AUTH })
    .toEqual(expect.arrayContaining(SYNCED_KEYS));
  await expectLoadingEnded(page);
};

const signOut = async (page: Page) => {
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
};

/** The cached storage state lacks the Firebase session (IndexedDB), so every case runs a real login. */
test.describe('Web auth lifecycle', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  // Real logins plus image fetches, twice over in the recovery cases.
  test.describe.configure({ timeout: TEST_TIMEOUTS.AUTH_LIFECYCLE });

  test('offers login only, and no data, while signed out', async ({ page }) => {
    await page.goto('/web-ext');

    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Bookmarks Page' })
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Persons Page' })
    ).toBeDisabled();
    expect(await presentSyncedKeys(page)).toEqual([]);
    expect(await cacheNames(page)).toEqual([]);
  });

  test('clears synced data and caches on logout, and neither reload nor Back brings them back', async ({
    page,
    context,
  }) => {
    await useTestCredentials(context);
    await page.goto('/web-ext');
    await signIn(page);
    await expect
      .poll(() => cacheNames(page), { timeout: TEST_TIMEOUTS.AUTH })
      .toEqual(SYNCED_CACHES);

    await test.step('the panel lists the account bookmarks', async () => {
      await page.goto('/bookmark-panel');
      await new BookmarksPanel(page).verifyBookmarkExists(
        TEST_BOOKMARKS.REACT_DOCS
      );
    });

    await page.goto('/web-ext');
    await signOut(page);

    await expect.poll(() => presentSyncedKeys(page)).toEqual([]);
    await expect.poll(() => cacheNames(page)).toEqual([]);

    await test.step('a reload does not restore it', async () => {
      await page.reload();

      await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
      expect(await presentSyncedKeys(page)).toEqual([]);
      expect(await cacheNames(page)).toEqual([]);
    });

    await test.step('going Back to the panel does not restore it either', async () => {
      await page.goBack();

      await expect(page).toHaveURL(/bookmark-panel/);
      await expect(new BookmarksPanel(page).getBookmarkItems()).toHaveCount(0);
      expect(await presentSyncedKeys(page)).toEqual([]);
    });
  });

  test('survives a failed bookmark preload and fills it in on a later login', async ({
    page,
    context,
  }) => {
    await useTestCredentials(context);
    const failedCalls = await routeTrpcProcedure(
      context,
      'firebaseData.bookmarksGet',
      failProcedure
    );

    await page.goto('/web-ext');
    await page.getByRole('button', { name: 'Login' }).click();

    // The person half of the same batch still lands
    await expect
      .poll(() => presentSyncedKeys(page), { timeout: TEST_TIMEOUTS.AUTH })
      .toEqual(expect.arrayContaining([EStorageKey.personImageUrls]));
    expect(
      failedCalls(),
      'the bookmark preload was not intercepted'
    ).not.toHaveLength(0);
    await expectLoadingEnded(page);
    expect(await presentSyncedKeys(page)).not.toContain(EStorageKey.bookmarks);
    expect(await cacheNames(page)).not.toContain(ECacheBucketKeys.favicon);

    await test.step('the persons page is still reachable', async () => {
      await page.getByRole('button', { name: 'Persons Page' }).click();

      await expect(page).toHaveURL(/persons-panel/);
      await new PersonsPanel(page).verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    });

    await test.step('signing in again once the request works fills the gap', async () => {
      await context.unrouteAll();
      await page.goto('/web-ext');
      await signOut(page);
      await signIn(page);

      await page.goto('/bookmark-panel');
      await new BookmarksPanel(page).verifyBookmarkExists(
        TEST_BOOKMARKS.REACT_DOCS
      );
    });
  });

  test('survives a failed person preload and fills it in on a later login', async ({
    page,
    context,
  }) => {
    await useTestCredentials(context);
    const failedCalls = await routeTrpcProcedure(
      context,
      'firebaseData.personsGet',
      failProcedure
    );

    await page.goto('/web-ext');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect
      .poll(() => cacheNames(page), { timeout: TEST_TIMEOUTS.AUTH })
      .toEqual([ECacheBucketKeys.favicon]);
    expect(
      failedCalls(),
      'the person preload was not intercepted'
    ).not.toHaveLength(0);
    await expectLoadingEnded(page);
    expect(await presentSyncedKeys(page)).toEqual([EStorageKey.bookmarks]);

    await test.step('the bookmarks page is still reachable', async () => {
      await page.getByRole('button', { name: 'Bookmarks Page' }).click();

      await expect(page).toHaveURL(/bookmark-panel/);
      await new BookmarksPanel(page).verifyBookmarkExists(
        TEST_BOOKMARKS.REACT_DOCS
      );
    });

    await test.step('signing in again once the request works fills the gap', async () => {
      await context.unrouteAll();
      await page.goto('/web-ext');
      await signOut(page);
      await signIn(page);

      await page.goto('/persons-panel');
      await new PersonsPanel(page).verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    });
  });
});
