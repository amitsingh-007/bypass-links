import { type Page } from '@playwright/test';

import {
  createSharedBackgroundSW,
  withTempProfileContext,
  getExtensionId,
  getPopupUrl,
  openExtensionPanelPage,
  sharedExtensionTest,
} from './base-fixture';

export const test = sharedExtensionTest.extend<{
  homePage: Page;
  unauthPage: Page;
}>({
  async homePage({ sharedContext, sharedExtensionId }, use) {
    const page = await openExtensionPanelPage(sharedContext, sharedExtensionId);
    try {
      await use(page);
    } finally {
      await page.close();
    }
  },

  async unauthPage({}, use) {
    await withTempProfileContext({}, async (context) => {
      const extensionId = await getExtensionId(
        await createSharedBackgroundSW(context)
      );
      const page = await context.newPage();
      await page.goto(getPopupUrl(extensionId), {
        waitUntil: 'domcontentloaded',
      });
      await use(page);
    });
  },
});

export const { expect } = test;
