import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type BrowserContext,
  type Page,
  type Worker,
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

export const signInWithEmailAndPassword = async (): Promise<IAuthResponse> => {
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

export const createSharedContext = async () => {
  const pathToExtension = path.resolve(dirName, '../../chrome-build');
  const userDataDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'chrome-profile-')
  );
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--disable-dev-shm-usage',
      '--no-sandbox',
    ],
  });
  return { browserContext, userDataDir };
};

export const createSharedBackgroundSW = async (
  sharedContext: BrowserContext
): Promise<Worker> => {
  let [background] = sharedContext.serviceWorkers();
  background ||= await sharedContext.waitForEvent('serviceworker');
  return background;
};

export const getExtensionId = async (
  sharedBackgroundSW: Worker
): Promise<string> => {
  const url = sharedBackgroundSW.url();
  return url.split('/')[2];
};

export const authenticateAndNavigate = async (
  sharedContext: BrowserContext,
  sharedExtensionId: string,
  panelName: 'bookmarks' | 'persons' | 'shortcuts'
): Promise<Page> => {
  const authData = await signInWithEmailAndPassword();

  await sharedContext.addInitScript(
    ({ authDataJson, key }) => {
      window.localStorage.setItem(key, authDataJson);
    },
    {
      authDataJson: JSON.stringify(authData),
      key: TEST_AUTH_DATA_KEY,
    }
  );

  const page = await sharedContext.newPage();
  const extUrl = `chrome-extension://${sharedExtensionId}/index.html`;
  await page.goto(extUrl);
  await page.waitForLoadState('networkidle');

  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.click({ force: true });

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await logoutButton.waitFor({ state: 'visible', timeout: 30_000 });

  const panelButton = page.getByRole('button', {
    name: new RegExp(panelName, 'i'),
  });
  await panelButton.click();

  await page.waitForLoadState('networkidle');

  return page;
};
