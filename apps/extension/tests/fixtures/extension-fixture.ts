import {
  test as base,
  chromium,
  type BrowserContext,
  Worker,
} from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../../build');
    const userDataDir = '/tmp/test-user-data-dir';
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
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

export const expect = test.expect;
