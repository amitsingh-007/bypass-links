/* eslint-disable react-hooks/rules-of-hooks */
import {
  type BrowserContext,
  type Page,
  type Worker,
  test as base,
} from '@playwright/test';
import { getExtensionPath } from '../utils/extension-path';
import {
  authenticateAndNavigate,
  createSharedBackgroundSW,
  createSharedContext,
  createUnauthContext,
  getExtensionId,
} from './base-fixture';

export const test = base.extend<
  {
    homePage: Page;
    unauthPage: Page;
    context: BrowserContext;
  },
  {
    sharedContext: BrowserContext;
    sharedBackgroundSW: Worker;
    sharedExtensionId: string;
    sharedPage: Page;
    extensionPath: string;
  }
>({
  extensionPath: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const pathToExtension = getExtensionPath();
      await use(pathToExtension);
    },
    { scope: 'worker' },
  ],

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

  sharedPage: [
    async ({ sharedContext, sharedExtensionId }, use) => {
      const page = await authenticateAndNavigate(
        sharedContext,
        sharedExtensionId,
        'home'
      );
      await use(page);
    },
    { scope: 'worker' },
  ],

  async homePage({ sharedPage }, use) {
    await use(sharedPage);
  },

  async context({ sharedContext }, use) {
    await use(sharedContext);
  },

  async unauthPage({ extensionPath }, use) {
    // Create a completely separate context without any authentication
    const { browserContext: unauthContext, userDataDir } =
      await createUnauthContext(extensionPath);

    // Get extension ID from the new context
    // Import the robust service worker getter from base-fixture
    const { createSharedBackgroundSW } = await import('./base-fixture');
    const background = await createSharedBackgroundSW(unauthContext);
    const extensionId = background.url().split('/')[2];

    // Create a new page without authentication
    const page = await unauthContext.newPage();
    const extUrl = `chrome-extension://${extensionId}/popup.html`;
    await page.goto(extUrl);
    await page.waitForLoadState('networkidle');

    await use(page);

    await page.close();
    await unauthContext.close();
    const fsPromises = await import('node:fs/promises');
    await fsPromises.rm(userDataDir, { recursive: true, force: true });
  },
});

export const { expect } = test;
