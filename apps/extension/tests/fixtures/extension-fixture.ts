import {
  Worker,
  test as base,
  chromium,
  type BrowserContext,
} from '@playwright/test';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// eslint-disable-next-line import/no-relative-packages
import { tempDir } from '../../../../scripts/global-teardown';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.resolve(dirName, '../../build');
    const browserContext = await chromium.launchPersistentContext(tempDir, {
      headless: false,
      channel: 'chrome',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    });
    await use(browserContext);
    await browserContext.close();
  },
  backgroundSW: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    await use(background);
  },
});

export const { expect } = test;
