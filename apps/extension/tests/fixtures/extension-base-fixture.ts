/* eslint-disable react-hooks/rules-of-hooks */
import {
  type BrowserContext,
  type Worker,
  test as base,
} from '@playwright/test';
import {
  createSharedBackgroundSW,
  createSharedContext,
  getExtensionId,
} from './base-fixture';

/**
 * Base extension fixture that provides shared worker-scoped resources.
 * All panel fixtures should extend from this to share the same browser context
 * within a worker, preventing conflicts when running tests in parallel.
 */
export const test = base.extend<
  // Test-scoped fixtures (none in base)
  object,
  // Worker-scoped fixtures
  {
    sharedContext: BrowserContext;
    sharedBackgroundSW: Worker;
    sharedExtensionId: string;
  }
>({
  sharedContext: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { browserContext, userDataDir } = await createSharedContext();
      await use(browserContext);
      await browserContext.close();
      const fsPromises = await import('node:fs/promises');
      await fsPromises.rm(userDataDir, { recursive: true, force: true });
    },
    { scope: 'worker' },
  ],

  sharedBackgroundSW: [
    async ({ sharedContext }, use) => {
      const background = await createSharedBackgroundSW(sharedContext);
      await use(background);
    },
    { scope: 'worker' },
  ],

  sharedExtensionId: [
    async ({ sharedBackgroundSW }, use) => {
      const id = await getExtensionId(sharedBackgroundSW);
      await use(id);
    },
    { scope: 'worker' },
  ],
});

export const { expect } = test;
