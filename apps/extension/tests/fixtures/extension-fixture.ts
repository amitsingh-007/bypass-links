import {
  Worker,
  test as base,
  chromium,
  type BrowserContext,
} from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempDir } from '../../../../scripts/global-teardown';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.resolve(dirName, '../../chrome-build');
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
