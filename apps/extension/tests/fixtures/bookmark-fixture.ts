import { type Page } from '@playwright/test';

import { openExtensionPanelPage, sharedExtensionTest } from './base-fixture';

export const test = sharedExtensionTest.extend<
  { bookmarksPage: Page },
  { sharedPage: Page }
>({
  sharedPage: [
    async ({ sharedContext, sharedExtensionId }, use) => {
      const page = await openExtensionPanelPage(
        sharedContext,
        sharedExtensionId,
        'bookmarks'
      );
      await use(page);
    },
    { scope: 'worker' },
  ],

  async bookmarksPage({ sharedPage }, use) {
    await use(sharedPage);
  },
});

export const { expect } = test;
