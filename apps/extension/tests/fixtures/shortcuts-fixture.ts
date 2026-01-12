/* eslint-disable react-hooks/rules-of-hooks */
import {
  type BrowserContext,
  type Page,
  type Worker,
  test as base,
} from '@playwright/test';
import {
  authenticateAndNavigate,
  createSharedBackgroundSW,
  createSharedContext,
  getExtensionId,
} from './base-fixture';

export const test = base.extend<
  {
    shortcutsPage: Page;
    context: BrowserContext;
  },
  {
    sharedContext: BrowserContext;
    sharedBackgroundSW: Worker;
    sharedExtensionId: string;
    sharedPage: Page;
  }
>({
  sharedContext: [
    async (_, use) => {
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

  sharedPage: [
    async ({ sharedContext, sharedExtensionId }, use) => {
      const page = await authenticateAndNavigate(
        sharedContext,
        sharedExtensionId,
        'shortcuts'
      );
      await use(page);
    },
    { scope: 'worker' },
  ],

  async shortcutsPage({ sharedPage }, use) {
    await use(sharedPage);
  },

  async context({ sharedContext }, use) {
    await use(sharedContext);
  },
});

export const { expect } = test;
