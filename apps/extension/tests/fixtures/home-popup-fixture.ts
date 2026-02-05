/* eslint-disable react-hooks/rules-of-hooks */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type BrowserContext, type Page, type Worker } from '@playwright/test';
import { authenticateAndNavigate, createUnauthContext } from './base-fixture';
import { test as base } from './extension-base-fixture';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

export const test = base.extend<
  {
    homePage: Page;
    unauthPage: Page;
    context: BrowserContext;
  },
  {
    sharedPage: Page;
    extensionPath: string;
    _sharedBackgroundSW: Worker;
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

  // Include sharedBackgroundSW in worker scope to pass to authenticateAndNavigate
  _sharedBackgroundSW: [
    async ({ sharedBackgroundSW }, use) => {
      await use(sharedBackgroundSW);
    },
    { scope: 'worker' },
  ],

  sharedPage: [
    async ({ sharedContext, sharedExtensionId, _sharedBackgroundSW }, use) => {
      const page = await authenticateAndNavigate(
        sharedContext,
        sharedExtensionId,
        'home',
        _sharedBackgroundSW
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

export { expect } from './extension-base-fixture';
