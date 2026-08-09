import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import {
  type BrowserContext,
  type Page,
  test as base,
  type Worker,
} from '@playwright/test';

import { EExtensionState, EExtStorageKey } from '@/constants';

import {
  createSharedBackgroundSW,
  getExtensionId,
  withTempProfileContext,
} from './base-fixture';

interface BaseBackgroundEnv {
  extensionId: string;
  readStorage: <T = unknown>(key: string) => Promise<T | undefined>;
  ensureActiveState: () => Promise<void>;
  ensureInactiveState: () => Promise<void>;
  clearHistoryStartTime: () => Promise<void>;
  setHistoryStartTime: (value: number) => Promise<void>;
  /** For URLs that may never load: shortcuts awaiting redirect, restricted, invalid. */
  openTab: (url: string) => Promise<Page>;
  /** For real pages, where returning mid-navigation lets a later reload race the load. */
  openLoadedTab: (url: string) => Promise<Page>;
}

const readStorageFromWorker = async <T = unknown>(
  backgroundSW: Worker,
  key: string
): Promise<T | undefined> => {
  return backgroundSW.evaluate(async (storageKey) => {
    const storage = await chrome.storage.local.get([storageKey]);
    return storage[storageKey] as T | undefined;
  }, key);
};

const writeStorageFromWorker = async (
  backgroundSW: Worker,
  values: Record<string, unknown>
) => {
  await backgroundSW.evaluate(async (storageValues) => {
    await chrome.storage.local.set(storageValues);
  }, values);
};

const removeStorageFromWorker = async (
  backgroundSW: Worker,
  keys: string | string[]
) => {
  await backgroundSW.evaluate(async (storageKeys) => {
    await chrome.storage.local.remove(storageKeys);
  }, keys);
};

const createBackgroundEnv = async (
  context: BrowserContext,
  extensionId: string
): Promise<BaseBackgroundEnv> => {
  const runWithBackground = async <T>(
    operation: (backgroundSW: Worker) => Promise<T>
  ): Promise<T> => {
    let lastError: unknown;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const backgroundSW = await createSharedBackgroundSW(context);
        return await operation(backgroundSW);
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
    }
    throw lastError;
  };

  return {
    extensionId,
    readStorage: async <T = unknown>(key: string) =>
      runWithBackground(async (backgroundSW) =>
        readStorageFromWorker<T>(backgroundSW, key)
      ),
    ensureActiveState: async () =>
      runWithBackground(async (backgroundSW) =>
        writeStorageFromWorker(backgroundSW, {
          extState: EExtensionState.ACTIVE,
        })
      ),
    ensureInactiveState: async () =>
      runWithBackground(async (backgroundSW) =>
        writeStorageFromWorker(backgroundSW, {
          extState: EExtensionState.INACTIVE,
        })
      ),
    clearHistoryStartTime: async () =>
      runWithBackground(async (backgroundSW) =>
        removeStorageFromWorker(backgroundSW, EExtStorageKey.HISTORY_START_TIME)
      ),
    setHistoryStartTime: async (value: number) =>
      runWithBackground(async (backgroundSW) =>
        writeStorageFromWorker(backgroundSW, { historyStartTime: value })
      ),
    async openTab(url: string) {
      const page = await context.newPage();
      // Shortcut URLs like http://bt/ fail DNS but the extension intercepts them via webRequest
      await page
        .goto(url, { waitUntil: 'commit', timeout: TEST_TIMEOUTS.NAVIGATION })
        .catch(() => undefined);
      return page;
    },
    async openLoadedTab(url: string) {
      const page = await context.newPage();
      // Failures surface here rather than as a puzzling assertion on about:blank
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: TEST_TIMEOUTS.PAGE_OPEN,
      });
      return page;
    },
  };
};

export const test = base.extend<
  { isolatedBackground: BaseBackgroundEnv },
  { sharedBackground: BaseBackgroundEnv }
>({
  async isolatedBackground({}, use, testInfo) {
    await withTempProfileContext(
      {
        prefix: 'chrome-background-profile-',
        headless: testInfo.project.use?.headless ?? true,
      },
      async (context) => {
        const backgroundSW = await createSharedBackgroundSW(context);
        const extensionId = await getExtensionId(backgroundSW);
        await use(await createBackgroundEnv(context, extensionId));
      }
    );
  },

  // Safe to share: the spec is describe.serial and each test resets its own state
  sharedBackground: [
    async ({}, use, testInfo) => {
      await withTempProfileContext(
        {
          prefix: 'chrome-profile-',
          headless: testInfo.project.use?.headless ?? true,
          seedFromCachedProfile: true,
        },
        async (context) => {
          const backgroundSW = await createSharedBackgroundSW(context);
          const extensionId = await getExtensionId(backgroundSW);
          await use(await createBackgroundEnv(context, extensionId));
        }
      );
    },
    { scope: 'worker' },
  ],
});

export const { expect } = test;
