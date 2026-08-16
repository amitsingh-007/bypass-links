import { removeTestDir } from '@bypass/shared/tests';
import { test as base, type BrowserContext, type Page } from '@playwright/test';

import { createSharedContext } from './base-fixture';

export const test = base.extend<
  {
    authenticatedPage: Page;
    context: BrowserContext;
  },
  {
    sharedContext: BrowserContext;
  }
>({
  sharedContext: [
    async ({}, use) => {
      const { browserContext, userDataDir } = await createSharedContext();
      await use(browserContext);
      await browserContext.close();
      await removeTestDir(userDataDir);
    },
    { scope: 'worker' },
  ],

  async context({ sharedContext }, use) {
    await use(sharedContext);
  },

  async authenticatedPage({ sharedContext }, use) {
    const page = await sharedContext.newPage();

    try {
      await use(page);
    } finally {
      await page.close();
    }
  },
});

export const { expect } = test;
