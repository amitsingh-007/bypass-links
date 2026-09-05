import { type Page } from '@playwright/test';

import { getExtensionPath } from '../utils/extension-path';
import {
  createSharedBackgroundSW,
  withTempProfileContext,
  getExtensionId,
  getPopupUrl,
  openExtensionPanelPage,
  sharedExtensionTest,
} from './base-fixture';

export const test = sharedExtensionTest.extend<
  {
    homePage: Page;
    unauthPage: Page;
  },
  { extensionPath: string }
>({
  extensionPath: [
    async ({}, use) => {
      await use(getExtensionPath());
    },
    { scope: 'worker' },
  ],

  async homePage({ sharedContext, sharedExtensionId }, use) {
    const page = await openExtensionPanelPage(
      sharedContext,
      sharedExtensionId,
      'home'
    );
    try {
      await use(page);
    } finally {
      await page.close();
    }
  },

  async unauthPage({ extensionPath }, use, testInfo) {
    await withTempProfileContext(
      {
        prefix: 'chrome-unauth-profile-',
        extensionPath,
        headless: testInfo.project.use?.headless ?? true,
      },
      async (context) => {
        const extensionId = await getExtensionId(
          await createSharedBackgroundSW(context)
        );
        const page = await context.newPage();
        await page.goto(getPopupUrl(extensionId), {
          waitUntil: 'domcontentloaded',
        });
        await use(page);
      }
    );
  },
});

export const { expect } = test;
