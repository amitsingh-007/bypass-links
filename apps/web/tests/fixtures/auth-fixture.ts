import fs from 'node:fs';
import path from 'node:path';

import {
  injectLocalStorage,
  instrumentContext,
  removeTestDir,
} from '@bypass/shared/tests';
import {
  chromium,
  test as base,
  type BrowserContext,
  type Cookie,
  type Page,
} from '@playwright/test';

import { AUTH_CACHE_DIR, WEB_STORAGE_PATH } from '../auth-constants';

/**
 * A browser context carrying the auth data cached by auth.setup.ts, reused
 * across every test in the same worker.
 */
const createSharedContext = async () => {
  const storageData: {
    localStorage: Record<string, string>;
    cookies: Cookie[];
  } = JSON.parse(fs.readFileSync(WEB_STORAGE_PATH, 'utf8'));

  const userDataDir = path.join(AUTH_CACHE_DIR, `test-profile-${Date.now()}`);

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  instrumentContext(browserContext);
  await injectLocalStorage(browserContext, storageData.localStorage);
  await browserContext.addCookies(storageData.cookies);

  return { browserContext, userDataDir };
};

export const test = base.extend<
  {
    authenticatedPage: Page;
    context: BrowserContext;
  },
  {
    sharedContext: BrowserContext;
  }
>({
  sharedContext: [
    async ({}, use) => {
      const { browserContext, userDataDir } = await createSharedContext();
      await use(browserContext);
      await browserContext.close();
      await removeTestDir(userDataDir);
    },
    { scope: 'worker' },
  ],

  async context({ sharedContext }, use) {
    await use(sharedContext);
  },

  async authenticatedPage({ sharedContext }, use) {
    const page = await sharedContext.newPage();

    try {
      await use(page);
    } finally {
      await page.close();
    }
  },
});

export const { expect } = test;
