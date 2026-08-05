import {
  type Worker,
  test as base,
  type BrowserContext,
} from '@playwright/test';

import {
  createSharedBackgroundSW,
  withTempProfileContext,
} from './base-fixture';

export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
}>({
  async context({}, use, testInfo) {
    await withTempProfileContext(
      {
        prefix: 'chrome-profile-',
        headless: testInfo.project.use?.headless ?? true,
      },
      async (browserContext) => use(browserContext)
    );
  },
  async backgroundSW({ context }, use) {
    await use(await createSharedBackgroundSW(context));
  },
});

export const { expect } = test;
