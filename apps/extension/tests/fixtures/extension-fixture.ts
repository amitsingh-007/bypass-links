/* eslint-disable react-hooks/rules-of-hooks */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  type Worker,
  test as base,
  chromium,
  type BrowserContext,
} from '@playwright/test';
import { getExtensionPath } from '../utils/extension-path';
import { createSharedBackgroundSW } from './base-fixture';

export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
}>({
  // eslint-disable-next-line no-empty-pattern
  async context({}, use) {
    const pathToExtension = getExtensionPath();
    const userDataDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'chrome-profile-')
    );
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
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
    const background = await createSharedBackgroundSW(context);
    await use(background);
  },
});

export const { expect } = test;
