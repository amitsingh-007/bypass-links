import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium, expect, test as setup } from '@playwright/test';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { getFirebasePublicConfig } from '../../../packages/configs/firebase.config';
import { TEST_AUTH_DATA_KEY } from '../src/constants';
import {
  AUTH_CACHE_DIR,
  CHROME_PROFILE_DIR,
  EXTENSION_STORAGE_PATH,
} from './auth-constants';
import type { IAuthResponse } from '@/interfaces/firebase';
import { getExpiresAtMs } from '@/store/firebase/utils';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

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
  const authData = await signInWithEmailAndPassword();

  await fs.promises.mkdir(AUTH_CACHE_DIR, { recursive: true });
  await fs.promises.rm(CHROME_PROFILE_DIR, { recursive: true, force: true });

  const pathToExtension = path.resolve(dirName, '../.output/chrome-mv3');

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

  let [background] = browserContext.serviceWorkers();
  background ||= await browserContext.waitForEvent('serviceworker', {
    timeout: 20_000,
  });
  const extensionId = background.url().split('/')[2];

  await browserContext.addInitScript(
    ({ authDataJson, key }) => {
      window.localStorage.setItem(key, authDataJson);
    },
    {
      authDataJson: JSON.stringify(authData),
      key: TEST_AUTH_DATA_KEY,
    }
  );

  const page = await browserContext.newPage();
  const extUrl = `chrome-extension://${extensionId}/popup.html`;
  await page.goto(extUrl, { waitUntil: 'domcontentloaded' });

  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 20_000 });
  await loginButton.click();

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible({ timeout: 30_000 });
  await expect(logoutButton).toBeEnabled({ timeout: 30_000 });

  const chromeStorageData = await page.evaluate(async () =>
    chrome.storage.local.get(null)
  );

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

  await browserContext.close();
});
