import { EStorageKey } from '@bypass/shared';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { expect, test, type BrowserContext } from '@playwright/test';

import { TEST_AUTH_DATA_KEY } from '@/constants';

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
import { getStorageItem } from '../utils/test-utils';

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

  test('signs out on its own when the extension is switched off', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const page = await openExtensionPanelPage(context, extensionId);

      await page.getByTestId('toggle-extension-switch').click();

      await expect(page.getByTestId('login-button')).toBeVisible({
        timeout: TEST_TIMEOUTS.AUTH,
      });
    });
  });
});

const controlSdkAuth = async (context: BrowserContext) => {
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
  const responses: Record<string, unknown> = {
    'extension.latest': {
      chrome: {
        version: '25.19.0',
        downloadLink: 'https://example.test/extension.zip',
        date: '2026-01-01',
      },
    },
    'firebaseData.bookmarksGet': { folderList: {}, urlList: {}, folders: {} },
    'firebaseData.personsGet': {},
    'firebaseData.redirectionsGet': [],
    'firebaseData.websitesGet': {},
    'firebaseData.lastVisitedGet': {},
  };
  await context.route('**/api/trpc/**', async (route) => {
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
      await context.route(
        'https://identitytoolkit.googleapis.com/**',
        async (route) => {
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
        await expect(loader).toBeVisible();
        const body = await page.evaluate(() => ({
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        }));
        expect(body.width).toBeGreaterThan(0);
        expect(body.height).toBeGreaterThan(0);
        const loaderBounds = await loader.boundingBox();
        expect(loaderBounds?.width).toBeGreaterThan(0);
        expect(loaderBounds?.height).toBeGreaterThan(0);
        await expect(page.getByTestId('login-button')).toHaveCount(0);
        await expect(page.getByTestId('logout-button')).toHaveCount(0);
      } finally {
        releaseRestore?.();
      }
      await expect(page.getByTestId('logout-button')).toBeEnabled();
      await expect(
        page.getByRole('img', { name: 'SDK test user', exact: true })
      ).toBeVisible();
      expect(await page.evaluate(() => window.e2eSawSignedOut)).toBe(false);
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
