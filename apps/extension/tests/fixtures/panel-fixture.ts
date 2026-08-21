import { expect, type Page } from '@playwright/test';

import { openExtensionPanelPage, sharedExtensionTest } from './base-fixture';

/**
 * Bookmarks and persons open their panel once per worker and let every test in
 * it share the page; shortcuts opens per test, since its specs mutate the rule
 * list and cannot see each other's edits.
 */
export const bookmarkTest = sharedExtensionTest.extend<
  NonNullable<unknown>,
  { bookmarksPage: Page }
>({
  bookmarksPage: [
    async ({ sharedContext, sharedExtensionId }, use) => {
      await use(
        await openExtensionPanelPage(
          sharedContext,
          sharedExtensionId,
          'bookmarks'
        )
      );
    },
    { scope: 'worker' },
  ],
});

export const personsTest = sharedExtensionTest.extend<
  NonNullable<unknown>,
  { personsPage: Page }
>({
  personsPage: [
    async ({ sharedContext, sharedExtensionId }, use) => {
      const page = await openExtensionPanelPage(
        sharedContext,
        sharedExtensionId,
        'persons'
      );
      await expect(
        page.locator('[data-testid^="person-item-"]').first()
      ).toBeVisible();
      await use(page);
    },
    { scope: 'worker' },
  ],
});

export const shortcutsTest = sharedExtensionTest.extend<{
  shortcutsPage: Page;
}>({
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

export { expect };
