import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  type Worker,
  test as base,
  type BrowserContext,
} from '@playwright/test';

import {
  createSharedBackgroundSW,
  launchExtensionContext,
} from './base-fixture';

export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
}>({
  async context({}, use, testInfo) {
    const userDataDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'chrome-profile-')
    );
    const browserContext = await launchExtensionContext({
      userDataDir,
      headless: testInfo.project.use?.headless ?? true,
    });
    await use(browserContext);
    await browserContext.close();
    await fs.promises.rm(userDataDir, { recursive: true, force: true });
  },
  async backgroundSW({ context }, use) {
    await use(await createSharedBackgroundSW(context));
  },
});

export const { expect } = test;
