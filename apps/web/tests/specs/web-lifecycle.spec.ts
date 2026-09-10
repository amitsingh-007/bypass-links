import process from 'node:process';

import { ECacheBucketKeys, EStorageKey } from '@bypass/shared';
import {
  failProcedure,
  routeTrpcProcedure,
  TEST_BOOKMARKS,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { type BrowserContext, type Page } from '@playwright/test';

import { TEST_CREDENTIALS_KEY } from '../../src/app/constants';
import { test, expect } from '../fixtures/base-fixture';
import { BookmarksPanel } from '../page-object-models/bookmarks-panel';
import { PersonsPanel } from '../page-object-models/persons-panel';

/** What a successful preload leaves behind, and what logout has to take away. */
const SYNCED_KEYS = [
  EStorageKey.bookmarks,
  EStorageKey.persons,
  EStorageKey.personImageUrls,
];
const SYNCED_CACHES = [ECacheBucketKeys.favicon, ECacheBucketKeys.person];

const ownedStorageKeys = async (page: Page) =>
  (await page.localStorage.items())
    .map(({ name }) => name)
    .filter((name) => SYNCED_KEYS.includes(name as EStorageKey));

const cacheNames = async (page: Page) =>
  page.evaluate(() => caches.keys().then((keys) => keys.toSorted()));

/** The same swap the auth setup makes, so Login uses the test account. */
const useTestCredentials = async (context: BrowserContext) => {
  await context.addInitScript(
    ({ credentialsJson, key }) => {
      window.localStorage.setItem(key, credentialsJson);
    },
    {
      credentialsJson: JSON.stringify({
        email: process.env.FIREBASE_TEST_USER_EMAIL,
        password: process.env.FIREBASE_TEST_USER_PASSWORD,
      }),
      key: TEST_CREDENTIALS_KEY,
    }
  );
};

/**
 * Waits on the synced data rather than the button: the button is briefly
 * "Logout" and enabled between the sign-in resolving and the preload starting.
 */
const signIn = async (page: Page) => {
  await page.getByRole('button', { name: 'Login' }).click();
  await expect
    .poll(() => ownedStorageKeys(page), { timeout: TEST_TIMEOUTS.AUTH })
    .toEqual(expect.arrayContaining(SYNCED_KEYS));
  await expect(page.getByRole('button', { name: 'Logout' })).toBeEnabled();
};

/**
 * The cached web storage state carries the account's data but not the Firebase
 * session, which lives in IndexedDB. Every case here therefore starts empty and
 * runs the real login, and logout only ever clears local data: the web app has
 * no mutating procedure, so the shared account is never written to.
 */
test.describe('Web auth lifecycle', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  // Real logins and real favicon/person image fetches, twice over in the
  // recovery cases; the default budget is for tests that only read storage
  test.describe.configure({ timeout: 90_000 });

  test('offers login only, and no data, while signed out', async ({ page }) => {
    await page.goto('/web-ext');

    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Bookmarks Page' })
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Persons Page' })
    ).toBeDisabled();
    expect(await ownedStorageKeys(page)).toEqual([]);
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
    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
    await expect.poll(() => ownedStorageKeys(page)).toEqual([]);
    await expect.poll(() => cacheNames(page)).toEqual([]);

    await test.step('a reload does not restore it', async () => {
      await page.reload();

      await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
      expect(await ownedStorageKeys(page)).toEqual([]);
      expect(await cacheNames(page)).toEqual([]);
    });

    await test.step('going Back to the panel does not restore it either', async () => {
      await page.goBack();

      await expect(page).toHaveURL(/bookmark-panel/);
      await expect(new BookmarksPanel(page).getBookmarkItems()).toHaveCount(0);
      expect(await ownedStorageKeys(page)).toEqual([]);
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

    // The person half of the same batch still lands, so it marks the end of the preload
    await expect
      .poll(() => ownedStorageKeys(page), { timeout: TEST_TIMEOUTS.AUTH })
      .toEqual(expect.arrayContaining([EStorageKey.personImageUrls]));
    expect(
      failedCalls(),
      'the bookmark preload was not intercepted'
    ).not.toHaveLength(0);
    await expect(page.getByRole('button', { name: 'Logout' })).toBeEnabled();
    expect(await ownedStorageKeys(page)).not.toContain(EStorageKey.bookmarks);
    expect(await cacheNames(page)).not.toContain(ECacheBucketKeys.favicon);

    await test.step('the persons page is still reachable', async () => {
      await page.getByRole('button', { name: 'Persons Page' }).click();

      await expect(page).toHaveURL(/persons-panel/);
      await expect(
        new PersonsPanel(page).getPersonItems().first()
      ).toBeVisible();
    });

    await test.step('signing in again once the request works fills the gap', async () => {
      await context.unrouteAll();
      await page.goto('/web-ext');
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();

      await signIn(page);
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
    await expect(page.getByRole('button', { name: 'Logout' })).toBeEnabled();
    expect(await ownedStorageKeys(page)).toEqual([EStorageKey.bookmarks]);

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
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();

      await signIn(page);
    });
  });
});
