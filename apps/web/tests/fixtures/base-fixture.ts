import fs from 'node:fs';
import path from 'node:path';

import { injectLocalStorage } from '@bypass/shared/tests';
import { chromium, type BrowserContext, type Cookie } from '@playwright/test';

import { AUTH_CACHE_DIR, WEB_STORAGE_PATH } from '../auth-constants';

interface CachedStorageData {
  localStorage: Record<string, string>;
  cookies: Cookie[];
}

/**
 * Creates a shared browser context with cached auth data.
 * This context is reused across all tests in the same worker.
 */
export const createSharedContext = async (): Promise<{
  browserContext: BrowserContext;
  userDataDir: string;
}> => {
  // Read cached storage from auth.setup.ts
  const storageData: CachedStorageData = JSON.parse(
    fs.readFileSync(WEB_STORAGE_PATH, 'utf8')
  );

  const userDataDir = path.join(AUTH_CACHE_DIR, `test-profile-${Date.now()}`);

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

  // Inject cached localStorage data
  await injectLocalStorage(browserContext, storageData.localStorage);

  // Add cached cookies
  await browserContext.addCookies(storageData.cookies);

  return { browserContext, userDataDir };
};
