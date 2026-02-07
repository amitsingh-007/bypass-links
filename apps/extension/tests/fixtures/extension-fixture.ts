/* eslint-disable react-hooks/rules-of-hooks */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {
  type Worker,
  test as base,
  chromium,
  type BrowserContext,
} from '@playwright/test';
import { getExtensionPath } from '../utils/extension-path';

export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
}>({
  // eslint-disable-next-line no-empty-pattern
  async context({}, use) {
    const pathToExtension = getExtensionPath();
    const headless = process.env.PW_HEADLESS !== 'false';
    const userDataDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'chrome-profile-')
    );
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chromium',
      headless,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    });
    await use(browserContext);
    await browserContext.close();
    await fs.promises.rm(userDataDir, { recursive: true, force: true });
  },
  async backgroundSW({ context }, use) {
    let [background] = context.serviceWorkers();
    background ||= await context.waitForEvent('serviceworker');
    await use(background);
  },
});

export const { expect } = test;
