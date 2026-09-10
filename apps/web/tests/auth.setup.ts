import fs from 'node:fs';
import process from 'node:process';

import {
  AUTH_CACHE_DIR,
  instrumentContext,
  TEST_TIMEOUTS,
  WEB_STORAGE_PATH,
} from '@bypass/shared/tests';
import { expect, test as setup } from '@playwright/test';

import { useTestCredentials } from './utils/test-credentials';

setup.setTimeout(60_000);

setup('authenticate and cache web storage', async ({ browser }) => {
  await fs.promises.mkdir(AUTH_CACHE_DIR, { recursive: true });
  const context = await browser.newContext();

  instrumentContext(context);

  await useTestCredentials(context);

  const page = await context.newPage();
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

  await expect
    .poll(() => page.localStorage.getItem('bookmarks'), {
      timeout: TEST_TIMEOUTS.AUTH,
    })
    .not.toBeNull();

  await context.storageState({ path: WEB_STORAGE_PATH });
  await context.close();
});
