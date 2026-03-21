/* eslint-disable react-hooks/rules-of-hooks */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  chromium,
  type BrowserContext,
  type Page,
  test as base,
  type Worker,
} from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { getExtensionPath } from '../utils/extension-path';
import {
  createSharedBackgroundSW,
  createSharedContext,
  getExtensionId,
} from './base-fixture';
import { EExtensionState } from '@/constants';

interface BaseBackgroundEnv {
  extensionId: string;
  readStorage: <T = unknown>(key: string) => Promise<T | undefined>;
  ensureActiveState: () => Promise<void>;
  ensureInactiveState: () => Promise<void>;
  clearHistoryStartTime: () => Promise<void>;
  setHistoryStartTime: (value: number) => Promise<void>;
  openTab: (url: string) => Promise<Page>;
}

const readStorageFromWorker = async <T = unknown>(
  backgroundSW: Worker,
  key: string
): Promise<T | undefined> => {
  return backgroundSW.evaluate(async (storageKey) => {
    const storage = await browser.storage.local.get([storageKey]);
    return storage[storageKey] as T | undefined;
  }, key);
};

const writeStorageFromWorker = async (
  backgroundSW: Worker,
  values: Record<string, unknown>
) => {
  await backgroundSW.evaluate(async (storageValues) => {
    await browser.storage.local.set(storageValues);
  }, values);
};

const removeStorageFromWorker = async (
  backgroundSW: Worker,
  keys: string | string[]
) => {
  await backgroundSW.evaluate(async (storageKeys) => {
    await browser.storage.local.remove(storageKeys);
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
        removeStorageFromWorker(backgroundSW, 'historyStartTime')
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
  };
};

export const test = base.extend<{
  isolatedBackground: BaseBackgroundEnv;
  sharedBackground: BaseBackgroundEnv;
}>({
  // eslint-disable-next-line no-empty-pattern
  async isolatedBackground({}, use, testInfo) {
    const extensionPath = getExtensionPath();
    const headless = testInfo.project.use?.headless ?? true;
    const userDataDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'chrome-background-profile-')
    );

    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chromium',
      headless,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    });

    try {
      const backgroundSW = await createSharedBackgroundSW(context);
      const extensionId = backgroundSW.url().split('/')[2];
      const env = await createBackgroundEnv(context, extensionId);

      await use(env);
    } finally {
      await context.close();
      await fs.rm(userDataDir, { recursive: true, force: true });
    }
  },

  // eslint-disable-next-line no-empty-pattern
  async sharedBackground({}, use, testInfo) {
    const { browserContext, userDataDir } = await createSharedContext({
      headless: testInfo.project.use?.headless ?? true,
    });

    try {
      const backgroundSW = await createSharedBackgroundSW(browserContext);
      const extensionId = await getExtensionId(backgroundSW);
      const env = await createBackgroundEnv(browserContext, extensionId);

      await use(env);
    } finally {
      await browserContext.close();
      await fs.rm(userDataDir, { recursive: true, force: true });
    }
  },
});

export const { expect } = test;
