import fs from 'node:fs';

import {
  AUTH_CACHE_DIR,
  CHROME_PROFILE_DIR,
  removeTestDir,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { expect, test as setup } from '@playwright/test';

import {
  getExtensionId,
  getPopupUrl,
  launchExtensionContext,
} from './fixtures/base-fixture';
import { useTestCredentials } from './utils/test-utils';

setup.setTimeout(60_000);

setup('authenticate and cache extension storage', async () => {
  await fs.promises.mkdir(AUTH_CACHE_DIR, { recursive: true });
  await removeTestDir(CHROME_PROFILE_DIR);

  const browserContext = await launchExtensionContext(CHROME_PROFILE_DIR);

  // Keeps its own AUTH timeout, so it does not use the shared SW helper
  let [background] = browserContext.serviceWorkers();
  background ||= await browserContext.waitForEvent('serviceworker', {
    timeout: TEST_TIMEOUTS.AUTH,
  });
  const extensionId = await getExtensionId(background);

  await useTestCredentials(browserContext);

  const page = await browserContext.newPage();
  await page.goto(getPopupUrl(extensionId), { waitUntil: 'domcontentloaded' });

  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.AUTH });
  await loginButton.click();

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible({ timeout: TEST_TIMEOUTS.AUTH });
  await expect(logoutButton).toBeEnabled({ timeout: TEST_TIMEOUTS.AUTH });

  await browserContext.close();
});
