/* eslint-disable react-hooks/rules-of-hooks */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type BrowserContext,
  type Page,
  type Worker,
  test as base,
} from '@playwright/test';
import {
  authenticateAndNavigateWithSession,
  createSharedBackgroundSW,
  createSharedContext,
  createUnauthContext,
  getExtensionId,
} from './base-fixture';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

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
      const pathToExtension = path.resolve(dirName, '../../chrome-build');
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
      const page = await authenticateAndNavigateWithSession(
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
    let [background] = unauthContext.serviceWorkers();
    background ||= await unauthContext.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];

    // Create a new page without authentication
    const page = await unauthContext.newPage();
    const extUrl = `chrome-extension://${extensionId}/index.html`;
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
