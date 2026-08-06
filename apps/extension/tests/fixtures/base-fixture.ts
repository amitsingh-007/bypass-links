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
 * `seedFromCachedProfile` copies the authenticated profile from auth setup,
 * preserving its Cache Storage. Omit it so no auth state leaks into
 * unauthenticated tests.
 */
export const createTempProfileContext = async ({
  prefix,
  extensionPath,
  headless,
  seedFromCachedProfile = false,
}: {
  prefix: string;
  extensionPath?: string;
  headless?: boolean;
  seedFromCachedProfile?: boolean;
}) => {
  // Temp dir rather than the cached profile itself, to avoid locking issues
  const userDataDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), prefix));

  try {
    if (seedFromCachedProfile) {
      await fs.promises.cp(CHROME_PROFILE_DIR, userDataDir, {
        recursive: true,
      });
    }
    const browserContext = await launchExtensionContext({
      userDataDir,
      extensionPath,
      headless,
    });
    return { browserContext, userDataDir };
  } catch (error) {
    // No caller owns the dir yet, so it would leak if seeding or launch throws
    await fs.promises.rm(userDataDir, { recursive: true, force: true });
    throw error;
  }
};

/** Runs `fn` against a fresh temp-profile context, always cleaning up after. */
export const withTempProfileContext = async <T>(
  options: Parameters<typeof createTempProfileContext>[0],
  fn: (context: BrowserContext) => Promise<T>
): Promise<T> => {
  const { browserContext, userDataDir } =
    await createTempProfileContext(options);
  try {
    return await fn(browserContext);
  } finally {
    await browserContext.close();
    await fs.promises.rm(userDataDir, { recursive: true, force: true });
  }
};

export const createSharedContext = async (
  options: { headless?: boolean } = {}
) =>
  createTempProfileContext({
    prefix: 'chrome-profile-',
    headless: options.headless,
    seedFromCachedProfile: true,
  });

export const createUnauthContext = async (
  extensionPath: string,
  options: { headless?: boolean } = {}
) =>
  createTempProfileContext({
    prefix: 'chrome-unauth-profile-',
    extensionPath,
    headless: options.headless,
  });

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

/** Worker-scoped extension env shared by every panel fixture. */
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
