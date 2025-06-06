/* eslint-disable react-hooks/rules-of-hooks */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Worker,
  test as base,
  chromium,
  type BrowserContext,
} from '@playwright/test';
import { tempDir } from '../../../../scripts/global-teardown';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
}>({
  // eslint-disable-next-line no-empty-pattern
  async context({}, use) {
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
  async backgroundSW({ context }, use) {
    let [background] = context.serviceWorkers();
    background ||= await context.waitForEvent('serviceworker');
    await use(background);
  },
});

export const { expect } = test;
