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
import { TEST_AUTH_DATA_KEY } from '../constants';
import type { IAuthResponse } from '@/interfaces/firebase';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

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

/**
 * Create an isolated browser context for unauthenticated tests.
 * This ensures no auth state leaks from the shared context.
 */
export const createUnauthContext = async (extensionPath: string) => {
  const userDataDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'chrome-unauth-profile-')
  );
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
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

const SESSION_FILE = path.join(process.cwd(), '.cache', 'auth-session.json');

/**
 * Authenticate using session file and navigate.
 * Assumes globalSetup has created the session file.
 */
export const authenticateAndNavigateWithSession = async (
  sharedContext: BrowserContext,
  sharedExtensionId: string,
  panelName?: 'bookmarks' | 'persons' | 'shortcuts' | 'home'
): Promise<Page> => {
  const fsPromises = await import('node:fs/promises');

  const sessionData = await fsPromises.readFile(SESSION_FILE, 'utf8');
  const authData = JSON.parse(sessionData) as IAuthResponse;

  const page = await sharedContext.newPage();
  const extUrl = `chrome-extension://${sharedExtensionId}/index.html`;
  await page.goto(extUrl);
  await page.waitForLoadState('networkidle');

  // Set localStorage directly on the page before clicking login
  await page.evaluate(
    ({ authDataJson, key }) => {
      window.localStorage.setItem(key, authDataJson);
    },
    { authDataJson: JSON.stringify(authData), key: TEST_AUTH_DATA_KEY }
  );

  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.click({ force: true });

  // Wait a bit for the auth to process
  await page.waitForTimeout(2000);

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await logoutButton.waitFor({ state: 'visible', timeout: 30_000 });

  if (panelName && panelName !== 'home') {
    const panelButton = page.getByRole('button', {
      name: new RegExp(panelName, 'i'),
    });
    await panelButton.click();
    await page.waitForLoadState('networkidle');
  }

  return page;
};
