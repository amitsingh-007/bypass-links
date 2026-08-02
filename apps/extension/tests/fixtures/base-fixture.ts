import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import {
  type BrowserContext,
  type Page,
  type Worker,
  chromium,
  test as base,
} from '@playwright/test';

import { CHROME_PROFILE_DIR, EXTENSION_STORAGE_PATH } from '../auth-constants';
import { getExtensionPath } from '../utils/extension-path';

interface CachedStorageData {
  chromeStorage: Record<string, unknown>;
  localStorage: Record<string, string>;
}

export const getPopupUrl = (extensionId: string) =>
  `chrome-extension://${extensionId}/popup.html`;

/**
 * Launch Chromium with the extension loaded. The CI-sensitive flags live here
 * only, so they cannot drift between the auth setup and the fixtures.
 */
export const launchExtensionContext = async ({
  userDataDir,
  extensionPath = getExtensionPath(),
  headless = true,
}: {
  userDataDir: string;
  extensionPath?: string;
  headless?: boolean;
}) =>
  chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--disable-dev-shm-usage',
      '--no-sandbox',
    ],
  });

/**
 * Load cached storage data from file.
 * This data is created by auth.setup.ts before tests run.
 */
export const loadCachedStorageData = async (): Promise<CachedStorageData> => {
  const data = await fs.promises.readFile(EXTENSION_STORAGE_PATH, 'utf8');
  return JSON.parse(data) as CachedStorageData;
};

/**
 * Create a shared browser context that reuses the cached Chrome profile.
 * This preserves Cache Storage data (person-cache, favicon-cache) from auth setup.
 */
export const createSharedContext = async (
  options: { headless?: boolean } = {}
) => {
  // Copy the cached profile to a temp directory (to avoid locking issues)
  const userDataDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'chrome-profile-')
  );

  // Copy cached profile contents to temp dir
  await fs.promises.cp(CHROME_PROFILE_DIR, userDataDir, { recursive: true });

  const browserContext = await launchExtensionContext({
    userDataDir,
    headless: options.headless,
  });
  return { browserContext, userDataDir };
};

/**
 * Create an isolated browser context for unauthenticated tests.
 * This ensures no auth state leaks from the shared context.
 */
export const createUnauthContext = async (
  extensionPath: string,
  options: { headless?: boolean } = {}
) => {
  const userDataDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'chrome-unauth-profile-')
  );
  const browserContext = await launchExtensionContext({
    userDataDir,
    extensionPath,
    headless: options.headless,
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

/**
 * Navigate to a panel. Since we're using the cached Chrome profile,
 * the extension should already be logged in with all data loaded.
 */
export const authenticateAndNavigate = async (
  sharedContext: BrowserContext,
  sharedExtensionId: string,
  panelName?: 'bookmarks' | 'persons' | 'shortcuts' | 'home'
): Promise<Page> => {
  const cachedData = await loadCachedStorageData();

  // Step 1: Inject localStorage via addInitScript (runs before any page script)
  await sharedContext.addInitScript(
    ({ localStorageData }) => {
      for (const [key, value] of Object.entries(localStorageData)) {
        window.localStorage.setItem(key, value);
      }
    },
    { localStorageData: cachedData.localStorage }
  );

  // Step 2: Create page and navigate to extension
  const page = await sharedContext.newPage();
  await page.goto(getPopupUrl(sharedExtensionId), {
    waitUntil: 'domcontentloaded',
  });

  // Step 3: Inject chrome.storage.local via extension page (avoid MV3 worker hangs)
  await page.evaluate(async (chromeStorageData) => {
    await chrome.storage.local.set(chromeStorageData);
  }, cachedData.chromeStorage);

  // Step 4: Reload to ensure storage is applied before UI checks
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Step 5: Verify we're logged in (logout button should be visible)
  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await logoutButton.waitFor({
    state: 'visible',
    timeout: TEST_TIMEOUTS.AUTH,
  });

  // Step 6: Navigate to requested panel
  if (panelName && panelName !== 'home') {
    const panelButton = page.getByRole('button', {
      name: new RegExp(panelName, 'i'),
    });
    await panelButton.click();
    await page.waitForLoadState('domcontentloaded');
  }

  return page;
};

/**
 * Open extension popup (or a panel) using existing authenticated context state.
 */
export const openExtensionPanelPage = async (
  sharedContext: BrowserContext,
  sharedExtensionId: string,
  panelName?: 'bookmarks' | 'persons' | 'shortcuts' | 'home'
): Promise<Page> => {
  const page = await sharedContext.newPage();
  await page.goto(getPopupUrl(sharedExtensionId), {
    waitUntil: 'domcontentloaded',
  });

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await logoutButton.waitFor({
    state: 'visible',
    timeout: TEST_TIMEOUTS.AUTH,
  });

  if (panelName && panelName !== 'home') {
    const panelButton = page.getByRole('button', {
      name: new RegExp(panelName, 'i'),
    });
    await panelButton.click();
    await page.waitForLoadState('domcontentloaded');
  }

  return page;
};

export interface SharedExtensionWorkerFixtures {
  sharedContext: BrowserContext;
  sharedBackgroundSW: Worker;
  sharedExtensionId: string;
}

/**
 * Worker-scoped extension environment shared by every panel fixture: one copied
 * Chrome profile, one background service worker, one extension id per worker.
 * Panel fixtures extend this and add only their own page fixture.
 */
export const sharedExtensionTest = base.extend<
  { context: BrowserContext },
  SharedExtensionWorkerFixtures
>({
  sharedContext: [
    async ({}, use, testInfo) => {
      const { browserContext, userDataDir } = await createSharedContext({
        headless: testInfo.project.use?.headless ?? true,
      });
      await use(browserContext);
      await browserContext.close();
      await fs.promises.rm(userDataDir, { recursive: true, force: true });
    },
    { scope: 'worker' },
  ],

  sharedBackgroundSW: [
    async ({ sharedContext }, use) => {
      await use(await createSharedBackgroundSW(sharedContext));
    },
    { scope: 'worker' },
  ],

  sharedExtensionId: [
    async ({ sharedBackgroundSW }, use) => {
      await use(await getExtensionId(sharedBackgroundSW));
    },
    { scope: 'worker' },
  ],

  async context({ sharedContext }, use) {
    await use(sharedContext);
  },
});
