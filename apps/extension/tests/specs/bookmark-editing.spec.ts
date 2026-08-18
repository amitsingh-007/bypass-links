import { TEST_BOOKMARKS } from '@bypass/shared/tests';

import { expect, test } from '../fixtures/bookmark-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';

const FIRST = TEST_BOOKMARKS.REACT_DOCS;
const SECOND = TEST_BOOKMARKS.GITHUB;

/**
 * The root listing, which is where both fixture bookmarks live. Opening a folder
 * is deliberately not part of this: `openFolder` single-clicks, and the folder
 * component reserves navigation for double-click, so it would not move anywhere.
 */
const openRootListing = async (panel: BookmarksPanel) => {
  await panel.ensureAtRoot();
};

// Worker-scoped page: reset so unsaved state never leaks into the next test
test.afterEach(async ({ bookmarksPage }) => {
  await new BookmarksPanel(bookmarksPage).ensureAtRoot();
});

test.describe('Bookmark multi-select', () => {
  test('offers bulk actions once a second bookmark is selected', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openRootListing(panel);

    await panel.selectBookmark(FIRST);
    await panel.selectBookmark(SECOND, { extend: true });
    await panel.openBookmarkContextMenu(SECOND);

    await expect(bookmarksPage.getByRole('menu')).toMatchAriaSnapshot(`
      - menu:
        - /children: equal
        - menuitem "Open all (2) in new tab"
        - menuitem "Cut"
        - menuitem "Delete All"
    `);

    await bookmarksPage.keyboard.press('Escape');
  });

  test('deletes every selected bookmark at once', async ({ bookmarksPage }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openRootListing(panel);
    const countBefore = await panel.getBookmarkCount();

    await panel.selectBookmark(FIRST);
    await panel.selectBookmark(SECOND, { extend: true });
    await panel.openBookmarkContextMenuItem(SECOND, 'delete-all');

    await expect(panel.getBookmarkElement(FIRST)).toBeHidden();
    await expect(panel.getBookmarkElement(SECOND)).toBeHidden();
    // Deliberately not saved: the deletion stays local to this page
    await expect(panel.getBookmarkItems()).toHaveCount(countBefore - 2);
  });
});

test.describe('Bookmark reordering', () => {
  test('lands a cut bookmark above an earlier paste target', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openRootListing(panel);

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([FIRST, SECOND]);

    await panel.moveBookmarkOnto(SECOND, FIRST);

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([SECOND, FIRST]);
  });

  test('lands a cut bookmark below a later paste target', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openRootListing(panel);

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([FIRST, SECOND]);

    await panel.moveBookmarkOnto(FIRST, SECOND);

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([SECOND, FIRST]);
  });
});

test.describe('Bookmark form validation', () => {
  test('refuses to save a bookmark without a title', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openRootListing(panel);

    const dialog = await panel.openEditBookmarkDialog(FIRST);
    await bookmarksPage.getByTestId('bookmark-title-input').clear();
    await dialog.getByTestId('dialog-save-button').click();

    await expect(dialog.getByText('Required')).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test('refuses to save a bookmark with a malformed url', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openRootListing(panel);

    const dialog = await panel.openEditBookmarkDialog(FIRST);
    await panel.getUrlInput().fill('not-a-valid-url');
    await dialog.getByTestId('dialog-save-button').click();

    await expect(dialog.getByText('Invalid URL format')).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test('refuses to create a folder without a name', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const dialog = await panel.openAddFolderDialog();
    await dialog.getByTestId('dialog-save-button').click();

    await expect(dialog.getByText('Required')).toBeVisible();
    await expect(dialog).toBeVisible();
  });
});
