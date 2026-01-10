/* eslint-disable react-hooks/rules-of-hooks */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type BrowserContext,
  type Page,
  type Worker,
  test as base,
  chromium,
} from '@playwright/test';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { getFirebasePublicConfig } from '../../../../packages/configs/firebase.config';
import { TEST_AUTH_DATA_KEY } from '../constants';
import type { IAuthResponse } from '@/interfaces/firebase';
import { getExpiresAtMs } from '@/store/firebase/utils';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const isCI = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL);
const firebaseConfig = getFirebasePublicConfig(isCI);

const identityApi = wretch('https://identitytoolkit.googleapis.com/v1')
  .addon(QueryStringAddon)
  .query({
    key: firebaseConfig.apiKey,
  });

const signInWithEmailAndPassword = async (): Promise<IAuthResponse> => {
  return identityApi
    .url('/accounts:signInWithPassword')
    .post({
      email: process.env.FIREBASE_TEST_USER_EMAIL,
      password: process.env.FIREBASE_TEST_USER_PASSWORD,
      returnSecureToken: true,
    })
    .json<IAuthResponse>((res) => ({
      uid: res.localId,
      email: res.email,
      fullName: res.displayName,
      photoUrl: '',
      displayName: res.displayName,
      idToken: res.idToken,
      expiresIn: Number(res.expiresIn),
      expiresAtMs: getExpiresAtMs(res.expiresIn),
      refreshToken: res.refreshToken,
    }));
};

/**
 * Worker-scoped fixture for bookmark panel testing.
 * Creates a SINGLE browser context that persists across ALL tests in the worker.
 * This ensures we login only once at the start and logout only at the end.
 */
export const test = base.extend<
  {
    bookmarksPage: Page;
    context: BrowserContext;
  },
  {
    // Worker-scoped fixtures (shared across all tests)
    sharedContext: BrowserContext;
    sharedBackgroundSW: Worker;
    sharedExtensionId: string;
    sharedPage: Page;
  }
>({
  // Worker-scoped context - created once per worker
  sharedContext: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const pathToExtension = path.resolve(dirName, '../../chrome-build');
      const userDataDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), 'chrome-profile-')
      );
      const browserContext = await chromium.launchPersistentContext(
        userDataDir,
        {
          headless: false,
          args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
            '--disable-dev-shm-usage',
            '--no-sandbox',
          ],
        }
      );
      await use(browserContext);
      await browserContext.close();
      await fs.promises.rm(userDataDir, { recursive: true, force: true });
    },
    { scope: 'worker' },
  ],

  // Worker-scoped background service worker
  sharedBackgroundSW: [
    async ({ sharedContext }, use) => {
      let [background] = sharedContext.serviceWorkers();
      background ||= await sharedContext.waitForEvent('serviceworker');
      await use(background);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped extension ID
  sharedExtensionId: [
    async ({ sharedBackgroundSW }, use) => {
      const url = sharedBackgroundSW.url();
      const id = url.split('/')[2];
      await use(id);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped page with login (created once)
  sharedPage: [
    async ({ sharedContext, sharedExtensionId }, use) => {
      // Get auth data
      const authData = await signInWithEmailAndPassword();

      // Add init script to inject auth data
      await sharedContext.addInitScript(
        ({ authDataJson, key }) => {
          window.localStorage.setItem(key, authDataJson);
        },
        {
          authDataJson: JSON.stringify(authData),
          key: TEST_AUTH_DATA_KEY,
        }
      );

      // Create page and navigate to extension
      const page = await sharedContext.newPage();
      const extUrl = `chrome-extension://${sharedExtensionId}/index.html`;
      await page.goto(extUrl);
      await page.waitForLoadState('networkidle');

      // Click login button to trigger auth with injected test data
      const loginButton = page.getByRole('button', { name: 'Login' });
      await loginButton.click({ force: true });

      // Wait for successful login (Logout button visible)
      const logoutButton = page.getByRole('button', { name: 'Logout' });
      await logoutButton.waitFor({ state: 'visible', timeout: 30_000 });

      // Navigate to bookmarks panel
      const bookmarksPanelButton = page.getByRole('button', {
        name: /bookmarks/i,
      });
      await bookmarksPanelButton.click();

      // Wait for bookmarks panel to load
      await page.waitForLoadState('networkidle');

      await use(page);
    },
    { scope: 'worker' },
  ],

  // Test-scoped fixture that reuses the worker-scoped page
  async bookmarksPage({ sharedPage }, use) {
    // Just return the shared page - it's already logged in
    await use(sharedPage);
  },

  // Expose sharedContext as context for tests that need it
  async context({ sharedContext }, use) {
    await use(sharedContext);
  },
});

export const { expect } = test;
