import { removeTestDir } from '@bypass/shared/tests';
import { type Page } from '@playwright/test';

import { getExtensionPath } from '../utils/extension-path';
import {
  createSharedBackgroundSW,
  createUnauthContext,
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
    // Create a completely separate context without any authentication
    const { browserContext: unauthContext, userDataDir } =
      await createUnauthContext(extensionPath, {
        headless: testInfo.project.use?.headless ?? true,
      });

    const extensionId = await getExtensionId(
      await createSharedBackgroundSW(unauthContext)
    );

    // Create a new page without authentication
    const page = await unauthContext.newPage();
    await page.goto(getPopupUrl(extensionId), {
      waitUntil: 'domcontentloaded',
    });

    await use(page);

    await page.close();
    await unauthContext.close();
    await removeTestDir(userDataDir);
  },
});

export const { expect } = test;
