import { type Page } from '@playwright/test';

import { openExtensionPanelPage, sharedExtensionTest } from './base-fixture';

export const test = sharedExtensionTest.extend<{ shortcutsPage: Page }>({
  async shortcutsPage({ sharedContext, sharedExtensionId }, use) {
    const page = await openExtensionPanelPage(
      sharedContext,
      sharedExtensionId,
      'shortcuts'
    );
    try {
      await use(page);
    } finally {
      await page.close();
    }
  },
});

export const { expect } = test;
