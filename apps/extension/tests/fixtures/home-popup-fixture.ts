/* eslint-disable react-hooks/rules-of-hooks */
import {
  type BrowserContext,
  type Page,
  type Worker,
  test as base,
} from '@playwright/test';
import { getExtensionPath } from '../utils/extension-path';
import {
  createSharedBackgroundSW,
  createSharedContext,
  createUnauthContext,
  getExtensionId,
  openExtensionPanelPage,
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
    async ({}, use, testInfo) => {
      const { browserContext, userDataDir } = await createSharedContext({
        headless: testInfo.project.use?.headless ?? true,
      });
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

  async homePage({ sharedContext, sharedExtensionId }, use) {
    const page = await openExtensionPanelPage(
      sharedContext,
      sharedExtensionId,
      'home'
    );
    try {
      await use(page);
    } finally {
      await page.close();
    }
  },

  async context({ sharedContext }, use) {
    await use(sharedContext);
  },

  async unauthPage({ extensionPath }, use, testInfo) {
    // Create a completely separate context without any authentication
    const { browserContext: unauthContext, userDataDir } =
      await createUnauthContext(extensionPath, {
        headless: testInfo.project.use?.headless ?? true,
      });

    // Get extension ID from the new context
    let [background] = unauthContext.serviceWorkers();
    background ||= await unauthContext.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];

    // Create a new page without authentication
    const page = await unauthContext.newPage();
    const extUrl = `chrome-extension://${extensionId}/popup.html`;
    await page.goto(extUrl, { waitUntil: 'domcontentloaded' });

    await use(page);

    await page.close();
    await unauthContext.close();
    const fsPromises = await import('node:fs/promises');
    await fsPromises.rm(userDataDir, { recursive: true, force: true });
  },
});

export const { expect } = test;
