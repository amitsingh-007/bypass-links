import fs from 'node:fs';
import process from 'node:process';

import {
  attachBackgroundCoverage,
  dumpLocalStorage,
  instrumentContext,
  setExtensionBuildDir,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { expect, test as setup } from '@playwright/test';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';

import type { IAuthResponse } from '@/interfaces/firebase';
import { mapAuthResponse } from '@/store/firebase/utils';

import { getFirebasePublicConfig } from '../../../packages/configs/firebase.config';
import { TEST_AUTH_DATA_KEY } from '../src/constants';
import {
  AUTH_CACHE_DIR,
  CHROME_PROFILE_DIR,
  EXTENSION_STORAGE_PATH,
} from './auth-constants';
import {
  getExtensionId,
  getPopupUrl,
  launchExtensionContext,
} from './fixtures/base-fixture';
import { getExtensionPath } from './utils/extension-path';

const isCI = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL);
const firebaseConfig = getFirebasePublicConfig(isCI);

const identityApi = wretch('https://identitytoolkit.googleapis.com/v1')
  .addon(QueryStringAddon)
  .query({ key: firebaseConfig.apiKey });

setup.setTimeout(60_000);

const signInWithEmailAndPassword = async (): Promise<IAuthResponse> => {
  return identityApi
    .url('/accounts:signInWithPassword')
    .post({
      email: process.env.FIREBASE_TEST_USER_EMAIL,
      password: process.env.FIREBASE_TEST_USER_PASSWORD,
      returnSecureToken: true,
    })
    .json<IAuthResponse>((res) => ({
      ...mapAuthResponse(res),
      photoUrl: '',
    }));
};

setup('authenticate and cache extension storage', async ({}, testInfo) => {
  const authData = await signInWithEmailAndPassword();

  await fs.promises.mkdir(AUTH_CACHE_DIR, { recursive: true });
  await fs.promises.rm(CHROME_PROFILE_DIR, { recursive: true, force: true });

  // Instrumented like any other context: this is the only run of the real
  // sign-in and Firebase sync, so leaving it out drops that coverage entirely
  setExtensionBuildDir(getExtensionPath());

  const browserContext = await launchExtensionContext({
    userDataDir: CHROME_PROFILE_DIR,
    headless: testInfo.project.use?.headless ?? true,
  });
  instrumentContext(browserContext);

  // Keeps its own AUTH timeout, so it does not use the shared SW helper
  let [background] = browserContext.serviceWorkers();
  background ||= await browserContext.waitForEvent('serviceworker', {
    timeout: TEST_TIMEOUTS.AUTH,
  });
  const extensionId = await getExtensionId(background);

  await attachBackgroundCoverage(browserContext, CHROME_PROFILE_DIR);

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
  await page.goto(getPopupUrl(extensionId), { waitUntil: 'domcontentloaded' });

  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.AUTH });
  await loginButton.click();

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible({ timeout: TEST_TIMEOUTS.AUTH });
  await expect(logoutButton).toBeEnabled({ timeout: TEST_TIMEOUTS.AUTH });

  const chromeStorageData = await page.evaluate(async () =>
    chrome.storage.local.get(null)
  );

  const localStorageData = await dumpLocalStorage(page);

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
