import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium, test as setup } from '@playwright/test';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { getFirebasePublicConfig } from '../../../packages/configs/firebase.config';
import { TEST_AUTH_DATA_KEY } from './constants';
import type { IAuthResponse } from '@/interfaces/firebase';
import { getExpiresAtMs } from '@/store/firebase/utils';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

export const AUTH_CACHE_DIR = path.join(process.cwd(), '.cache');
export const EXTENSION_STORAGE_PATH = path.join(
  AUTH_CACHE_DIR,
  'extension-storage.json'
);
export const CHROME_PROFILE_DIR = path.join(AUTH_CACHE_DIR, 'chrome-profile');

const isCI = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL);
const firebaseConfig = getFirebasePublicConfig(isCI);

const identityApi = wretch('https://identitytoolkit.googleapis.com/v1')
  .addon(QueryStringAddon)
  .query({ key: firebaseConfig.apiKey });

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

setup('authenticate and cache extension storage', async () => {
  // Step 1: Get Firebase auth token
  const authData = await signInWithEmailAndPassword();

  // Step 2: Create cache directory and persistent Chrome profile
  await fs.promises.mkdir(AUTH_CACHE_DIR, { recursive: true });

  // Clean up old profile if exists (for fresh login each CI run)
  if (
    await fs.promises
      .access(CHROME_PROFILE_DIR)
      .then(() => true)
      .catch(() => false)
  ) {
    await fs.promises.rm(CHROME_PROFILE_DIR, { recursive: true, force: true });
  }

  await fs.promises.mkdir(CHROME_PROFILE_DIR, { recursive: true });

  // Step 3: Launch browser with extension using persistent profile
  const pathToExtension = path.resolve(dirName, '../chrome-build');

  const browserContext = await chromium.launchPersistentContext(
    CHROME_PROFILE_DIR,
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

  // Step 4: Wait for extension service worker
  let [background] = browserContext.serviceWorkers();
  background ||= await browserContext.waitForEvent('serviceworker');
  const extensionId = background.url().split('/')[2];

  // Step 5: Inject test auth data into localStorage before login
  await browserContext.addInitScript(
    ({ authDataJson, key }) => {
      window.localStorage.setItem(key, authDataJson);
    },
    {
      authDataJson: JSON.stringify(authData),
      key: TEST_AUTH_DATA_KEY,
    }
  );

  // Step 6: Navigate to extension and complete login
  const page = await browserContext.newPage();
  const extUrl = `chrome-extension://${extensionId}/index.html`;
  await page.goto(extUrl);
  await page.waitForLoadState('networkidle');

  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.click({ force: true });

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await logoutButton.waitFor({ state: 'visible', timeout: 30_000 });

  // Step 7: Extract all chrome.storage.local data
  const chromeStorageData = await page.evaluate(async () => {
    return new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve(result);
      });
    });
  });

  // Step 9: Get localStorage data (including __fbOAuth)
  const localStorageData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        data[key] = window.localStorage.getItem(key) ?? '';
      }
    }

    return data;
  });

  // Step 11: Save storage data to file (for localStorage/chrome.storage injection)
  await fs.promises.writeFile(
    EXTENSION_STORAGE_PATH,
    JSON.stringify(
      {
        chromeStorage: chromeStorageData,
        localStorage: localStorageData,
        extensionId,
      },
      null,
      2
    )
  );

  // Step 12: Close browser (profile is saved to disk)
  await browserContext.close();
});
