import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  type BrowserContext,
  type Page,
  type Worker,
  chromium,
} from '@playwright/test';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const EXTENSION_STORAGE_PATH = path.join(
  process.cwd(),
  '.cache',
  'extension-storage.json'
);

const CHROME_PROFILE_DIR = path.join(process.cwd(), '.cache', 'chrome-profile');

interface CachedStorageData {
  chromeStorage: Record<string, unknown>;
  localStorage: Record<string, string>;
  extensionId: string;
}

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
export const createSharedContext = async () => {
  const pathToExtension = path.resolve(dirName, '../../chrome-build');

  // Copy the cached profile to a temp directory (to avoid locking issues)
  const userDataDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'chrome-profile-')
  );

  // Copy cached profile contents to temp dir
  await copyDir(CHROME_PROFILE_DIR, userDataDir);

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
 * Recursively copy a directory.
 */
async function copyDir(src: string, dest: string): Promise<void> {
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  await fs.promises.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

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

  // Step 1: Inject localStorage via addInitScript (backup for any missing data)
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
  const extUrl = `chrome-extension://${sharedExtensionId}/index.html`;
  await page.goto(extUrl);

  // Step 3: Inject chrome.storage.local data (backup for any missing data)
  await page.evaluate(async (chromeStorageData) => {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set(chromeStorageData, () => {
        resolve();
      });
    });
  }, cachedData.chromeStorage);

  // Step 4: Reload the page to pick up the injected storage
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Step 5: Verify we're logged in (logout button should be visible)
  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await logoutButton.waitFor({ state: 'visible', timeout: 10_000 });

  // Step 6: Navigate to requested panel
  if (panelName && panelName !== 'home') {
    const panelButton = page.getByRole('button', {
      name: new RegExp(panelName, 'i'),
    });
    await panelButton.click();
    await page.waitForLoadState('networkidle');
  }

  return page;
};
