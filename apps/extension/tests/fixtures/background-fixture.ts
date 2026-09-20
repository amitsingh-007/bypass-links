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
  getPopupUrl,
  withTempProfileContext,
} from './base-fixture';

interface BaseBackgroundEnv {
  context: BrowserContext;
  extensionId: string;
  readStorage: (key: string) => Promise<unknown>;
  writeStorage: (values: Record<string, unknown>) => Promise<void>;
  ensureActiveState: () => Promise<void>;
  ensureInactiveState: () => Promise<void>;
  clearHistoryStartTime: () => Promise<void>;
  setHistoryStartTime: (value: number) => Promise<void>;
  /** For URLs that may never load: shortcuts awaiting redirect, restricted, invalid. */
  openTab: (url: string) => Promise<Page>;
  /** For real pages, where returning mid-navigation lets a later reload race the load. */
  openLoadedTab: (url: string) => Promise<Page>;
  openFixturePage: (
    url: string,
    html: string,
    extraPages?: Record<string, string>
  ) => Promise<Page>;
  /** An extension page, which is the only place `chrome.runtime` is reachable. */
  openPopup: () => Promise<Page>;
}

const readStorageFromWorker = async (
  backgroundSW: Worker,
  key: string
): Promise<unknown> => {
  return backgroundSW.evaluate(async (storageKey) => {
    const storage = await chrome.storage.local.get([storageKey]);
    return storage[storageKey];
  }, key);
};

export const writeStorageFromWorker = async (
  backgroundSW: Worker,
  values: Record<string, unknown>
) => {
  await backgroundSW.evaluate(async (storageValues) => {
    await chrome.storage.local.set(storageValues);
  }, values);
};

export const removeStorageFromWorker = async (
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
  const openLoadedTab = async (url: string) => {
    const page = await context.newPage();
    // Failures surface here rather than as a puzzling assertion on about:blank
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: TEST_TIMEOUTS.PAGE_OPEN,
    });
    return page;
  };

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
    context,
    extensionId,
    readStorage: async (key: string) =>
      runWithBackground(async (backgroundSW) =>
        readStorageFromWorker(backgroundSW, key)
      ),
    writeStorage: async (values: Record<string, unknown>) =>
      runWithBackground(async (backgroundSW) =>
        writeStorageFromWorker(backgroundSW, values)
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
      // Shortcut URLs like http://bt/ fail DNS, but tabs.onUpdated still fires
      // with the url, which is what the redirect listens on
      await page
        .goto(url, { waitUntil: 'commit', timeout: TEST_TIMEOUTS.NAVIGATION })
        .catch(() => undefined);
      return page;
    },
    openLoadedTab,
    async openPopup() {
      return openLoadedTab(getPopupUrl(extensionId));
    },
    async openFixturePage(
      url: string,
      html: string,
      extraPages: Record<string, string> = {}
    ) {
      const page = await context.newPage();
      for (const [pageUrl, pageHtml] of Object.entries({
        ...extraPages,
        [url]: html,
      })) {
        await page.route(pageUrl, async (route) => {
          await route.fulfill({ contentType: 'text/html', body: pageHtml });
        });
      }
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
  async isolatedBackground({}, use) {
    await withTempProfileContext({}, async (context) => {
      const backgroundSW = await createSharedBackgroundSW(context);
      const extensionId = await getExtensionId(backgroundSW);
      await use(await createBackgroundEnv(context, extensionId));
    });
  },

  // Shared across specs and workers, so anything written here must be restored
  sharedBackground: [
    async ({}, use) => {
      await withTempProfileContext(
        { seedFromCachedProfile: true },
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
