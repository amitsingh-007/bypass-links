import { expect as baseExpect, type Page } from '@playwright/test';

import { openExtensionPanelPage, sharedExtensionTest } from './base-fixture';

export const test = sharedExtensionTest.extend<
  { personsPage: Page },
  { sharedPage: Page }
>({
  sharedPage: [
    async ({ sharedContext, sharedExtensionId }, use) => {
      const page = await openExtensionPanelPage(
        sharedContext,
        sharedExtensionId,
        'persons'
      );
      await baseExpect(
        page.locator('[data-testid^="person-item-"]').first()
      ).toBeVisible();
      await use(page);
    },
    { scope: 'worker' },
  ],

  async personsPage({ sharedPage }, use) {
    await use(sharedPage);
  },
});

export const { expect } = test;
