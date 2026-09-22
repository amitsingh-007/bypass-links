import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  attachBackgroundCoverage,
  CHROME_PROFILE_DIR,
  coverageBrowserArgs,
  EXTENSION_STORAGE_PATH,
  instrumentContext,
  removeTestDir,
  setExtensionBuildDir,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import {
  type BrowserContext,
  type Page,
  type ViewportSize,
  type Worker,
  chromium,
  expect,
  test as base,
} from '@playwright/test';
import { z } from 'zod/mini';

import { getExtensionPath } from '../utils/extension-path';

const CachedStorageDataSchema = z.object({
  chromeStorage: z.record(z.string(), z.unknown()),
  localStorage: z.record(z.string(), z.string()),
});

/** Product shots need a fixed canvas; tests keep the browser defaults. */
interface ContextSizeOptions {
  deviceScaleFactor?: number;
  viewport?: ViewportSize;
}

export const getPopupUrl = (extensionId: string) =>
  `chrome-extension://${extensionId}/popup.html`;

/**
 * Coverage is wired up here rather than by callers: it has to be in place
 * before the first page opens, and the callers that had to remember it had
 * already forgotten, silently dropping everything the auth setup covers.
 */
export const launchExtensionContext = async (
  userDataDir: string,
  { deviceScaleFactor, viewport }: ContextSizeOptions = {}
) => {
  const extensionPath = getExtensionPath();
  setExtensionBuildDir(extensionPath);
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    // Manual launch, so `--headed` has to be read from the project explicitly
    headless: base.info().project.use.headless,
    deviceScaleFactor,
    ...(viewport && { viewport }),
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--disable-dev-shm-usage',
      '--no-sandbox',
      ...coverageBrowserArgs,
    ],
  });
  instrumentContext(browserContext);
  await attachBackgroundCoverage(browserContext, userDataDir);
  return browserContext;
};

/** Storage data cached by auth.setup.ts before tests run. */
export const loadCachedStorageData = async () => {
  const data = await fs.promises.readFile(EXTENSION_STORAGE_PATH, 'utf8');
  return CachedStorageDataSchema.parse(JSON.parse(data));
};

/**
 * `seedFromCachedProfile` copies the authenticated profile from auth setup,
 * preserving its Cache Storage. Omit it so no auth state leaks into
 * unauthenticated tests.
 */
interface TempProfileOptions extends ContextSizeOptions {
  seedFromCachedProfile?: boolean;
}

const createTempProfileContext = async ({
  seedFromCachedProfile = false,
  ...sizeOptions
}: TempProfileOptions) => {
  // Temp dir rather than the cached profile itself, to avoid locking issues
  const userDataDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'chrome-profile-')
  );

  try {
    if (seedFromCachedProfile) {
      // Chrome's own caches are most of the profile and nothing the tests read
      await fs.promises.cp(CHROME_PROFILE_DIR, userDataDir, {
        recursive: true,
        filter: (source) =>
          !/\/(Cache|Code Cache|GPUCache|Dawn\w+Cache)$/.test(source),
      });
    }
    const browserContext = await launchExtensionContext(
      userDataDir,
      sizeOptions
    );
    return { browserContext, userDataDir };
  } catch (error) {
    // No caller owns the dir yet, so it would leak if seeding or launch throws
    await removeTestDir(userDataDir);
    throw error;
  }
};

/** Runs `fn` against a fresh temp-profile context, always cleaning up after. */
export const withTempProfileContext = async <T>(
  options: TempProfileOptions,
  fn: (context: BrowserContext) => Promise<T>
): Promise<T> => {
  const { browserContext, userDataDir } =
    await createTempProfileContext(options);
  try {
    return await fn(browserContext);
  } finally {
    // Nested so a rejecting close() still cannot skip the removal
    try {
      await browserContext.close();
    } finally {
      await removeTestDir(userDataDir);
    }
  }
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

export const openExtensionPanelPage = async (
  sharedContext: BrowserContext,
  sharedExtensionId: string,
  panelName?: 'bookmarks' | 'persons' | 'shortcuts'
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

  if (panelName) {
    const panelButton = page.getByRole('button', {
      name: new RegExp(panelName, 'i'),
    });
    await panelButton.click();
    await page.waitForLoadState('domcontentloaded');
  }

  return page;
};

/** Only logout pushes panel saves to the shared account; abort it so a regression cannot rewrite the test account. */
export const abortAccountWrites = async (
  context: BrowserContext,
  procedures: readonly string[] = ['bookmarkAndPersonSave']
) => {
  let sawAccountWrite = false;
  await context.route('**/api/trpc**', async (route) => {
    const request = route.request();
    const call = `${request.url()}${request.postData() ?? ''}`;
    const isAccountWrite = procedures.some((name) => call.includes(name));
    if (isAccountWrite) {
      sawAccountWrite = true;
      await route.abort();
      return;
    }
    await route.fallback();
  });
  return () => sawAccountWrite;
};

interface SharedExtensionWorkerFixtures {
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
    async ({}, use) => {
      await withTempProfileContext(
        { seedFromCachedProfile: true },
        async (context) => {
          const sawAccountWrite = await abortAccountWrites(context);
          await use(context);
          expect
            .soft(
              sawAccountWrite(),
              'a panel save reached the shared test account'
            )
            .toBe(false);
        }
      );
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
