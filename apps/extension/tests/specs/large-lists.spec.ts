import { expectVirtualizedList, TEST_LARGE_LIST } from '@bypass/shared/tests';
import { expect, test } from '@playwright/test';

import { openExtensionPanelPage } from '../fixtures/base-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PersonsPanel } from '../utils/persons-panel';
import { withSignedInProfile } from '../utils/signed-in-profile';
import { seedFolderWithBookmarks, seedPersons } from '../utils/test-utils';

const { SIZE, SEARCHED_INDEX, bookmarkTitle, bookmarkUrl, personName } =
  TEST_LARGE_LIST;

const LARGE_FOLDER = 'E2E Large Folder';

const seededBookmarks = Array.from({ length: SIZE }, (_, index) => ({
  title: bookmarkTitle(index),
  url: bookmarkUrl(index),
}));
const seededPersonNames = Array.from({ length: SIZE }, (_, index) =>
  personName(index)
);

test.describe('Large virtualized lists', () => {
  test('scrolls and searches a large bookmark folder', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const page = await openExtensionPanelPage(
        context,
        extensionId,
        'bookmarks'
      );
      const panel = new BookmarksPanel(page);
      await seedFolderWithBookmarks(page, LARGE_FOLDER, seededBookmarks);
      await panel.ensureAtRoot();

      // Not `openFolder`: it asserts the whole listing, which a virtualized folder never renders
      await panel.getFolderElement(LARGE_FOLDER).dblclick();

      await expectVirtualizedList({
        page,
        rows: panel.getBookmarkItems(),
        first: panel.getBookmarkElement(bookmarkTitle(0)),
        last: panel.getBookmarkElement(bookmarkTitle(SIZE - 1)),
        searchFor: bookmarkTitle(SEARCHED_INDEX),
        listedNames: async () => panel.getBookmarkTitles(),
        scrollToEnd: async () => page.getByTestId('scroll-to-bottom').click(),
        scrollToStart: async () => page.getByTestId('scroll-to-top').click(),
      });
    });
  });

  test('scrolls and searches a large persons list', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const page = await openExtensionPanelPage(
        context,
        extensionId,
        'persons'
      );
      const panel = new PersonsPanel(page);
      await seedPersons(page, seededPersonNames);
      await panel.ensureAtRoot();
      expect(await panel.getHeaderPersonCount()).toBe(SIZE);

      await expectVirtualizedList({
        page,
        rows: panel.getPersonItems(),
        first: panel.getPersonCardElement(personName(0)),
        last: panel.getPersonCardElement(personName(SIZE - 1)),
        searchFor: personName(SEARCHED_INDEX),
        listedNames: async () => panel.getPersonNames(),
        scrollToEnd: async () => page.getByTestId('scroll-to-bottom').click(),
        scrollToStart: async () => page.getByTestId('scroll-to-top').click(),
      });
    });
  });
});
