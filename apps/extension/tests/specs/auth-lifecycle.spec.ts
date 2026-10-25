import {
  ECacheBucketKeys,
  EStorageKey,
  encodeBookmark,
  type IBookmarksObj,
} from '@bypass/shared';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { expect, test, type BrowserContext } from '@playwright/test';

import { EExtStorageKey, TEST_AUTH_DATA_KEY } from '@/constants';

import {
  readDynamicRules,
  writeStorageFromWorker,
} from '../fixtures/background-fixture';
import {
  createSharedBackgroundSW,
  getExtensionId,
  getPopupUrl,
  openExtensionPanelPage,
  withTempProfileContext,
} from '../fixtures/base-fixture';
import {
  GOOGLE_LOGOUT_TABS,
  withSignedInProfile,
} from '../utils/signed-in-profile';
import { getRedirectionStorage, getStorageItem } from '../utils/test-utils';

test.describe('Auth lifecycle', () => {
  test('clears synced storage and opens the account tabs on logout', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const page = await openExtensionPanelPage(context, extensionId);
      const tabsBefore = context.pages().length;

      await page.getByTestId('logout-button').click();

      await expect(page.getByTestId('login-button')).toBeVisible({
        timeout: TEST_TIMEOUTS.AUTH,
      });
      expect(await getStorageItem(page, EStorageKey.bookmarks)).toBeUndefined();
      expect(await getStorageItem(page, EStorageKey.persons)).toBeUndefined();
      expect(
        await getStorageItem(page, EStorageKey.redirections)
      ).toBeUndefined();
      await expect
        .poll(() => context.pages().length, {
          timeout: TEST_TIMEOUTS.PAGE_OPEN,
        })
        .toBe(tabsBefore + GOOGLE_LOGOUT_TABS.length);
    });
  });

  test('switching off logs out and enabling again does not restore the session or redirects', async () => {
    await withSignedInProfile(
      async ({ context, extensionId, backgroundSW }) => {
        const page = await openExtensionPanelPage(context, extensionId);
        const alias = 'http://e2e-signed-in-toggle/';
        const target = 'https://logout-target.test/';
        const shortcuts = getRedirectionStorage([
          { id: crypto.randomUUID(), alias, website: target, isDefault: false },
        ]);
        await writeStorageFromWorker(backgroundSW, shortcuts);
        await expect.poll(() => readDynamicRules(context)).toHaveLength(1);
        await expect(page.getByTestId('logout-button')).toBeEnabled();
        const extensionSwitch = page.getByTestId('toggle-extension-switch');
        const tabsBefore = context.pages().length;

        await extensionSwitch.click();
        await expect(extensionSwitch).not.toBeChecked();
        await expect(page.getByTestId('login-button')).toBeDisabled();
        await expect.poll(() => readDynamicRules(context)).toEqual([]);
        for (const key of [
          EStorageKey.bookmarks,
          EStorageKey.persons,
          EStorageKey.redirections,
          EStorageKey.mappedRedirections,
          EStorageKey.lastVisited,
          EStorageKey.websites,
        ] as const) {
          expect(await getStorageItem(page, key), key).toBeUndefined();
        }
        await expect
          .poll(() => context.pages().length)
          .toBe(tabsBefore + GOOGLE_LOGOUT_TABS.length);

        await page.reload();
        await expect(extensionSwitch).not.toBeChecked();
        await expect(page.getByTestId('login-button')).toBeDisabled();
        await extensionSwitch.click();
        await expect(extensionSwitch).toBeChecked();
        await expect(page.getByTestId('login-button')).toBeEnabled();
        await expect.poll(() => readDynamicRules(context)).toEqual([]);
        await page.close();
        const reopened = await context.newPage();
        await reopened.goto(getPopupUrl(extensionId));
        await expect(reopened.getByTestId('login-button')).toBeEnabled();
        for (const key of [
          EStorageKey.redirections,
          EStorageKey.mappedRedirections,
        ] as const) {
          expect(await getStorageItem(reopened, key)).toBeUndefined();
        }
        await expect.poll(() => readDynamicRules(context)).toEqual([]);
        expect(context.pages()).toHaveLength(
          tabsBefore + GOOGLE_LOGOUT_TABS.length
        );
      }
    );
  });
});

const controlSdkAuth = async (
  context: BrowserContext,
  bookmarks: IBookmarksObj = { folderList: {}, urlList: {}, folders: {} }
) => {
  const uid = 'sdk-test-user';
  const issuedAt = Math.floor(Date.now() / 1000);
  const idToken = [
    'eyJhbGciOiJSUzI1NiJ9',
    Buffer.from(
      JSON.stringify({
        sub: uid,
        iat: issuedAt,
        exp: issuedAt + 3600,
        auth_time: issuedAt,
      })
    ).toString('base64url'),
    'test-signature',
  ].join('.');
  const user = {
    localId: uid,
    email: 'sdk@test.invalid',
    displayName: 'SDK test user',
    photoUrl: 'https://avatar.test/user.svg',
    emailVerified: true,
    providerUserInfo: [],
  };
  const credentials = { email: user.email, password: 'sdk-test-password' };
  await context.route(
    'https://identitytoolkit.googleapis.com/**',
    async (route) => {
      const url = route.request().url();
      if (url.includes('accounts:lookup')) {
        await route.fulfill({ json: { users: [user] } });
      } else if (url.includes('accounts:signInWith')) {
        await route.fulfill({
          json: {
            ...user,
            idToken,
            refreshToken: 'sdk-refresh-token',
            expiresIn: '3600',
          },
        });
      } else {
        await route.fulfill({ json: { recaptchaEnforcementState: [] } });
      }
    }
  );
  await context.route(user.photoUrl, async (route) => {
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="blue"/></svg>',
    });
  });
  let latestCalls = 0;
  const authorizationHeaders: (string | undefined)[] = [];
  const responses: Record<string, unknown> = {
    'extension.latest': {
      chrome: {
        version: '25.21.0',
        downloadLink: 'https://example.test/extension.zip',
        date: '2026-01-01',
      },
    },
    'firebaseData.bookmarksGet': bookmarks,
    'firebaseData.personsGet': {},
    'firebaseData.redirectionsList': [],
    'firebaseData.websitesGet': {},
    'firebaseData.lastVisitedGet': {},
    'firebaseData.bookmarkAndPersonSave': null,
  };
  await context.route('**/api/trpc/**', async (route) => {
    authorizationHeaders.push(route.request().headers().authorization);
    const procedures = new URL(route.request().url()).pathname
      .split('/api/trpc/')[1]
      .split(',');
    const body = procedures.map((procedure) => {
      if (procedure === 'extension.latest') latestCalls++;
      const response = responses[procedure];
      if (response === undefined)
        throw new Error(`Unexpected procedure ${procedure}`);
      return { result: { data: response } };
    });
    await route.fulfill({ json: body });
  });
  return {
    credentials,
    idToken,
    latestCalls: () => latestCalls,
    authorizationHeaders,
  };
};

const openMockPopup = async (context: BrowserContext) => {
  const extensionId = await getExtensionId(
    await createSharedBackgroundSW(context)
  );
  const page = await context.newPage();
  await page.goto(getPopupUrl(extensionId));
  return page;
};

declare global {
  interface Window {
    e2eSawSignedOut?: boolean;
  }
}

test.describe('SDK authentication', () => {
  test('switch-off waits for SDK restoration before logging out a session without a saved profile', async () => {
    await withTempProfileContext({}, async (context) => {
      const sdk = await controlSdkAuth(context);
      for (const url of GOOGLE_LOGOUT_TABS) {
        await context.route(`${url}**`, async (route) => {
          await route.fulfill({ contentType: 'text/html', body: '' });
        });
      }
      const page = await openMockPopup(context);
      await page.localStorage.setItem(
        TEST_AUTH_DATA_KEY,
        JSON.stringify(sdk.credentials)
      );
      await page.getByTestId('login-button').click();
      await expect(page.getByTestId('logout-button')).toBeEnabled();
      await page.localStorage.removeItem('firebase-profile');

      let releaseRestore: (() => void) | undefined;
      const pendingRestore = new Promise<void>((resolve) => {
        releaseRestore = resolve;
      });
      let restoreCalls = 0;
      await context.route(
        'https://identitytoolkit.googleapis.com/**',
        async (route) => {
          restoreCalls++;
          await pendingRestore;
          await route.fallback();
        }
      );
      const extensionSwitch = page.getByTestId('toggle-extension-switch');
      try {
        await page.reload();
        await expect.poll(() => restoreCalls).toBeGreaterThan(0);
        await expect(page.getByTestId('login-button')).toBeDisabled();
        await extensionSwitch.click();
        await expect(extensionSwitch).toBeChecked();
        await expect(extensionSwitch).toBeDisabled();
        await expect(page.getByTestId('loading-overlay')).toBeVisible();
      } finally {
        releaseRestore?.();
      }

      await expect(extensionSwitch).not.toBeChecked();
      await expect(page.getByTestId('login-button')).toBeDisabled();
      expect(
        JSON.parse(
          (await page.localStorage.getItem('firebase-profile')) ?? '{}'
        )
      ).toEqual({
        state: { idpAuth: null },
        version: 0,
      });
      await expect(page.getByTestId('loading-overlay')).toHaveCount(0);
    });
  });

  test('completes login when a favicon is missing without cache logs', async () => {
    await withTempProfileContext({}, async (context) => {
      const bookmark = encodeBookmark({
        id: 'missing-favicon',
        url: 'https://mixdrop.co/',
        title: 'Missing favicon',
        parentHash: '',
        taggedPersons: [],
      });
      const sdk = await controlSdkAuth(context, {
        folderList: {},
        folders: {},
        urlList: { [bookmark.id]: bookmark },
      });
      const faviconUrl =
        'https://www.google.com/s2/favicons?domain=mixdrop.co&sz=32';
      let imageRequests = 0;
      await context.route(faviconUrl, async (route) => {
        imageRequests++;
        await route.fulfill({ status: 404, body: '' });
      });
      const page = await openMockPopup(context);
      const messages: string[] = [];
      const errors: string[] = [];
      page.on('console', (message) => messages.push(message.text()));
      page.on('pageerror', (error) => errors.push(error.message));
      await page.localStorage.setItem(
        TEST_AUTH_DATA_KEY,
        JSON.stringify(sdk.credentials)
      );
      await page.getByTestId('login-button').click();
      await expect(page.getByTestId('logout-button')).toBeEnabled();
      expect(imageRequests).toBe(1);
      expect(
        await page.evaluate(
          async ({ bucket, url }) =>
            Boolean(await (await caches.open(bucket)).match(url)),
          { bucket: ECacheBucketKeys.favicon, url: faviconUrl }
        )
      ).toBe(false);
      expect(
        messages.filter(
          (message) =>
            message.includes('Cache.add()') ||
            message.includes('Failed to cache:')
        )
      ).toEqual([]);
      expect(errors).toEqual([]);
    });
  });

  test('keeps the SDK session and profile on reopen without a signed-out flash', async () => {
    await withTempProfileContext({}, async (context) => {
      const sdk = await controlSdkAuth(context);
      const page = await openMockPopup(context);
      await page.localStorage.setItem(
        TEST_AUTH_DATA_KEY,
        JSON.stringify(sdk.credentials)
      );
      await page.getByTestId('login-button').click();
      await expect(page.getByTestId('logout-button')).toBeEnabled();
      expect(await page.localStorage.getItem(TEST_AUTH_DATA_KEY)).toBeNull();
      expect(
        JSON.parse(
          (await page.localStorage.getItem('firebase-profile')) ?? '{}'
        )
      ).toEqual({
        state: {
          idpAuth: {
            uid: 'sdk-test-user',
            displayName: 'SDK test user',
            photoURL: 'https://avatar.test/user.svg',
          },
        },
        version: 0,
      });
      await expect.poll(sdk.latestCalls).toBeGreaterThan(0);
      const callsBeforeRestore = sdk.latestCalls();
      await page.addInitScript(() => {
        window.e2eSawSignedOut = false;
        new MutationObserver(() => {
          if (document.querySelector('[data-testid="login-button"]'))
            window.e2eSawSignedOut = true;
        }).observe(document, { childList: true, subtree: true });
      });
      let releaseRestore: (() => void) | undefined;
      const pendingRestore = new Promise<void>((resolve) => {
        releaseRestore = resolve;
      });
      let restoreCalls = 0;
      await context.route(
        'https://identitytoolkit.googleapis.com/**',
        async (route) => {
          restoreCalls++;
          await pendingRestore;
          await route.fallback();
        }
      );
      try {
        await page.reload();
        // The fixture opens a tab, so apply Chrome's popup content sizing.
        await page.evaluate(() => {
          document.documentElement.classList.add('popup');
        });
        const loader = page.getByTestId('loading-overlay');
        await expect(page.getByTestId('home-popup-heading')).toBeVisible();
        await expect(page.getByTestId('logout-button')).toBeEnabled();
        await expect(
          page.getByRole('img', { name: 'SDK test user', exact: true })
        ).toBeVisible();
        await expect(loader).toHaveCount(0);
        await expect.poll(() => restoreCalls).toBeGreaterThan(0);
        expect(sdk.latestCalls()).toBe(callsBeforeRestore);
        const body = await page.evaluate(() => ({
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        }));
        expect(body.width).toBeGreaterThan(0);
        expect(body.height).toBeGreaterThan(0);
        await expect(page.getByTestId('login-button')).toHaveCount(0);
        await page
          .getByRole('button', { name: 'Shortcuts', exact: true })
          .click();
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        expect(sdk.latestCalls()).toBe(callsBeforeRestore);
      } finally {
        releaseRestore?.();
      }
      await expect(page.getByTestId('logout-button')).toBeEnabled();
      await expect(
        page.getByRole('img', { name: 'SDK test user', exact: true })
      ).toBeVisible();
      expect(await page.evaluate(() => window.e2eSawSignedOut)).toBe(false);
      await expect.poll(sdk.latestCalls).toBeGreaterThan(callsBeforeRestore);
      expect(
        sdk.authorizationHeaders.every(
          (header) => header === `Bearer ${sdk.idToken}`
        )
      ).toBe(true);
    });
  });

  for (const failure of ['missing session', 'different account'] as const) {
    test(`blocks the popup and keeps local data after restoring a ${failure}`, async () => {
      await withTempProfileContext({}, async (context) => {
        const sdk = await controlSdkAuth(context);
        const page = await openMockPopup(context);
        await page.localStorage.setItem(
          TEST_AUTH_DATA_KEY,
          JSON.stringify(sdk.credentials)
        );
        await page.getByTestId('login-button').click();
        await expect(page.getByTestId('logout-button')).toBeEnabled();
        const data = {
          [EStorageKey.bookmarks]: { folderList: {}, urlList: {}, folders: {} },
          [EExtStorageKey.HAS_PENDING_BOOKMARKS]: true,
        };
        await writeStorageFromWorker(
          await createSharedBackgroundSW(context),
          data
        );
        const savedProfile =
          await page.localStorage.getItem('firebase-profile');
        if (failure === 'missing session') {
          await context.route(
            'https://identitytoolkit.googleapis.com/**',
            async (route) => {
              await route.fulfill({
                status: 400,
                json: { error: { message: 'USER_DISABLED' } },
              });
            }
          );
        } else {
          await page.localStorage.setItem(
            'firebase-profile',
            JSON.stringify({
              state: {
                idpAuth: {
                  uid: 'another-user',
                  displayName: 'Saved user',
                  photoURL: null,
                },
              },
              version: 0,
            })
          );
        }
        await page.reload();
        const dialog = page.getByRole('dialog', {
          name: "We couldn't verify your session.",
        });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('button')).toHaveCount(0);
        await expect(page.getByTestId('home-popup-heading')).toBeVisible();
        const toggle = page.getByTestId('toggle-extension-switch');
        await expect(toggle).toBeChecked();
        await expect(
          toggle.click({ trial: true, timeout: 500 })
        ).rejects.toThrow();
        await page.keyboard.press('Escape');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Space');
        await page.keyboard.press('Enter');
        await expect(dialog).toBeVisible();
        await expect(toggle).toBeChecked();
        await expect
          .poll(() =>
            dialog.evaluate((element) =>
              element.contains(document.activeElement)
            )
          )
          .toBe(true);
        expect(await getStorageItem(page, EStorageKey.bookmarks)).toEqual(
          data[EStorageKey.bookmarks]
        );
        expect(
          await getStorageItem(page, EExtStorageKey.HAS_PENDING_BOOKMARKS)
        ).toBe(true);
        if (failure === 'missing session')
          expect(await page.localStorage.getItem('firebase-profile')).toBe(
            savedProfile
          );
      });
    });
  }

  test('ignores malformed saved profiles and clears the profile on logout', async () => {
    await withTempProfileContext({}, async (context) => {
      const sdk = await controlSdkAuth(context);
      const page = await openMockPopup(context);
      for (const raw of [
        '{',
        JSON.stringify({ state: { idpAuth: { uid: 5 } }, version: 0 }),
      ]) {
        await page.localStorage.setItem('firebase-profile', raw);
        await page.reload();
        await expect(page.getByTestId('login-button')).toBeEnabled();
        await expect(page.getByRole('dialog')).toHaveCount(0);
      }
      await page.localStorage.setItem(
        TEST_AUTH_DATA_KEY,
        JSON.stringify(sdk.credentials)
      );
      await page.getByTestId('login-button').click();
      await expect(page.getByTestId('logout-button')).toBeEnabled();
      const pendingBookmark = encodeBookmark({
        id: 'pending-upgrade-bookmark',
        url: 'https://pending.test/',
        title: 'Pending local edit',
        parentHash: '',
        taggedPersons: [],
      });
      const pendingBookmarks = {
        folderList: {},
        folders: {},
        urlList: { [pendingBookmark.id]: pendingBookmark },
      };
      await writeStorageFromWorker(await createSharedBackgroundSW(context), {
        [EStorageKey.bookmarks]: pendingBookmarks,
        [EExtStorageKey.HAS_PENDING_BOOKMARKS]: true,
      });
      await page.localStorage.removeItem('firebase-profile');
      let releaseRestore: (() => void) | undefined;
      const pendingRestore = new Promise<void>((resolve) => {
        releaseRestore = resolve;
      });
      let restoreCalls = 0;
      await context.route(
        'https://identitytoolkit.googleapis.com/**',
        async (route) => {
          restoreCalls++;
          await pendingRestore;
          await route.fallback();
        }
      );
      try {
        await page.reload();
        await expect.poll(() => restoreCalls).toBeGreaterThan(0);
        await expect(page.getByTestId('home-popup-heading')).toBeVisible();
        await expect(page.getByTestId('login-button')).toBeDisabled();
        await expect(page.getByTestId('loading-overlay')).toHaveCount(0);
      } finally {
        releaseRestore?.();
      }
      await expect(page.getByTestId('logout-button')).toBeEnabled();
      expect(await getStorageItem(page, EStorageKey.bookmarks)).toEqual(
        pendingBookmarks
      );
      expect(
        await getStorageItem(page, EExtStorageKey.HAS_PENDING_BOOKMARKS)
      ).toBe(true);
      await page.getByTestId('logout-button').click();
      await expect(page.getByTestId('login-button')).toBeEnabled();
      expect(
        JSON.parse(
          (await page.localStorage.getItem('firebase-profile')) ?? '{}'
        )
      ).toEqual({ state: { idpAuth: null }, version: 0 });
      await page.reload();
      await expect(page.getByTestId('login-button')).toBeEnabled();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    });
  });

  test('shares one SDK token refresh between concurrent API requests', async () => {
    await withTempProfileContext({}, async (context) => {
      const sdk = await controlSdkAuth(context);
      const page = await openMockPopup(context);
      await page.clock.install();
      await page.localStorage.setItem(
        TEST_AUTH_DATA_KEY,
        JSON.stringify(sdk.credentials)
      );
      await page.getByTestId('login-button').click();
      await expect(page.getByTestId('logout-button')).toBeEnabled();
      await expect.poll(sdk.latestCalls).toBeGreaterThan(0);
      let refreshCalls = 0;
      let release: (() => void) | undefined;
      const pendingRefresh = new Promise<void>((resolve) => {
        release = resolve;
      });
      await context.route(
        'https://securetoken.googleapis.com/**',
        async (route) => {
          refreshCalls++;
          await pendingRefresh;
          await route.fulfill({
            json: {
              access_token: sdk.idToken,
              refresh_token: 'sdk-refreshed-token',
              expires_in: '3600',
              token_type: 'Bearer',
              user_id: 'sdk-test-user',
            },
          });
        }
      );
      const callsBefore = sdk.latestCalls();
      await page.clock.setFixedTime(Date.now() + 3600 * 1000);
      try {
        for (let open = 0; open < 2; open++) {
          await page
            .getByRole('button', { name: 'Shortcuts', exact: true })
            .click();
          await page.getByRole('button', { name: 'Back', exact: true }).click();
          await expect(page.getByTestId('logout-button')).toBeVisible();
          if (open === 0) await expect.poll(() => refreshCalls).toBe(1);
        }
      } finally {
        release?.();
      }
      await expect
        .poll(sdk.latestCalls)
        .toBeGreaterThanOrEqual(callsBefore + 2);
      expect(refreshCalls).toBe(1);
    });
  });
});
