/* eslint-disable react-hooks/rules-of-hooks */
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
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { browserContext, userDataDir } = await createSharedContext();
      await use(browserContext);
      await browserContext.close();
      const fsPromises = await import('node:fs/promises');
      await fsPromises.rm(userDataDir, { recursive: true, force: true });
    },
    { scope: 'worker' },
  ],

  async context({ sharedContext }, use) {
    await use(sharedContext);
  },

  async authenticatedPage({ sharedContext }, use) {
    const page = await sharedContext.newPage();
    const webUrl =
      process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000';

    await page.goto(`${webUrl}/bookmark-panel`, { waitUntil: 'networkidle' });

    try {
      await use(page);
    } finally {
      await page.close();
    }
  },
});

export const { expect } = test;
