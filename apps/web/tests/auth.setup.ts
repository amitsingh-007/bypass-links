import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import {
  BASE_BROWSER_ARGS,
  dumpLocalStorage,
  instrumentContext,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { chromium, expect, test as setup } from '@playwright/test';

import { TEST_CREDENTIALS_KEY } from '../src/app/constants';
import { AUTH_CACHE_DIR, WEB_STORAGE_PATH } from './auth-constants';

const testCredentials = JSON.stringify({
  email: process.env.FIREBASE_TEST_USER_EMAIL,
  password: process.env.FIREBASE_TEST_USER_PASSWORD,
});

setup.setTimeout(60_000);

setup('authenticate and cache web storage', async ({}, testInfo) => {
  await fs.promises.mkdir(AUTH_CACHE_DIR, { recursive: true });
  const headless = testInfo.project.use?.headless ?? true;

  const browserContext = await chromium.launchPersistentContext(
    path.join(AUTH_CACHE_DIR, 'web-profile'),
    {
      channel: 'chromium',
      headless,
      args: BASE_BROWSER_ARGS,
    }
  );

  // The real login and preload pipeline only ever runs here
  instrumentContext(browserContext);

  await browserContext.addInitScript(
    ({ credentialsJson, key }) => {
      window.localStorage.setItem(key, credentialsJson);
    },
    {
      credentialsJson: testCredentials,
      key: TEST_CREDENTIALS_KEY,
    }
  );

  const page = await browserContext.newPage();
  const webUrl =
    process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000';

  await page.goto(`${webUrl}/web-ext`, { waitUntil: 'networkidle' });

  const loginButton = page.getByRole('button', { name: 'Login' });
  await expect(loginButton).toBeVisible({ timeout: TEST_TIMEOUTS.AUTH });
  await loginButton.click();

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible({ timeout: TEST_TIMEOUTS.AUTH });
  await expect(logoutButton).toBeEnabled({ timeout: TEST_TIMEOUTS.AUTH });

  const bookmarksPageButton = page.getByRole('button', {
    name: 'Bookmarks Page',
  });
  await expect(bookmarksPageButton).toBeEnabled({
    timeout: TEST_TIMEOUTS.AUTH,
  });

  await page.waitForFunction(
    () => {
      const bookmarks = localStorage.getItem('bookmarks');
      return bookmarks !== null;
    },
    { timeout: TEST_TIMEOUTS.AUTH }
  );

  const localStorageData = await dumpLocalStorage(page);

  const cookies = await browserContext.cookies();

  await fs.promises.writeFile(
    WEB_STORAGE_PATH,
    JSON.stringify({ localStorage: localStorageData, cookies }, null, 2)
  );

  await browserContext.close();
});
