import {
  TEST_BOOKMARKS,
  TEST_FOLDERS,
  TEST_SITES,
  clearSearchInput,
  fillSearchInput,
} from '@bypass/shared/tests';

import { expect, bookmarkTest as test } from '../fixtures/panel-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import {
  getRecordedTabs,
  recordCreatedTabs,
  seedFolderWithBookmarks,
} from '../utils/test-utils';

const FIRST = TEST_BOOKMARKS.REACT_DOCS;
const SECOND = TEST_BOOKMARKS.GITHUB;

/** Root has too few rows for a filter to hide one a bulk action could then hit. */
const SELECTION_FOLDER = 'Selection Test Folder';
const SELECTION_BOOKMARKS = [
  { title: 'Alpha One', url: `${TEST_SITES.EXAMPLE_COM}/alpha-one` },
  { title: 'Beta One', url: `${TEST_SITES.EXAMPLE_COM}/beta-one` },
  { title: 'Alpha Two', url: `${TEST_SITES.EXAMPLE_COM}/alpha-two` },
  { title: 'Beta Two', url: `${TEST_SITES.EXAMPLE_COM}/beta-two` },
] as const;
const SELECTION_TITLES = SELECTION_BOOKMARKS.map(({ title }) => title);

// Worker-scoped page: reset so unsaved state never leaks into the next test
test.afterEach(async ({ bookmarksPage }) => {
  await new BookmarksPanel(bookmarksPage).ensureAtRoot();
});

test.describe('Bookmark multi-select', () => {
  test('offers bulk actions once a second bookmark is selected', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    await panel.selectBookmark(FIRST);
    await panel.selectBookmark(SECOND, { extend: true });
    await panel.openBookmarkContextMenu(SECOND);

    await expect(panel.getContextMenu()).toMatchAriaSnapshot(`
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
    await panel.ensureAtRoot();
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
    await panel.ensureAtRoot();

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([FIRST, SECOND]);

    await panel.moveBookmarkOnto(SECOND, FIRST);

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([SECOND, FIRST]);
  });

  test('lands a cut bookmark below a later paste target', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([FIRST, SECOND]);

    await panel.moveBookmarkOnto(FIRST, SECOND);

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([SECOND, FIRST]);
  });
});

/** Overlaying the trigger reads as "the dropdown never opened": same bg-popover. */
test('opens the folder dropdown clear of the trigger', async ({
  bookmarksPage,
}) => {
  const panel = new BookmarksPanel(bookmarksPage);
  await panel.ensureAtRoot();

  const dialog = await panel.openEditBookmarkDialog(FIRST);
  const trigger = dialog.getByTestId('bookmark-folder-select');
  await trigger.click();

  const dropdown = bookmarksPage.getByRole('listbox');
  await expect(
    dropdown.getByRole('option', { name: TEST_FOLDERS.MAIN })
  ).toBeVisible();

  // Polled, not read once: the entry animation slides the popup 8px past its
  // settled position, which is more than its clearance over the trigger
  await expect
    .poll(
      async () => {
        const triggerBox = await trigger.boundingBox();
        const dropdownBox = await dropdown.boundingBox();
        if (!triggerBox || !dropdownBox) {
          return null;
        }
        return (
          dropdownBox.y < triggerBox.y + triggerBox.height &&
          triggerBox.y < dropdownBox.y + dropdownBox.height
        );
      },
      { message: 'the dropdown covers the trigger it opened from' }
    )
    .toBe(false);
});

test.describe('Bookmark form validation', () => {
  test('refuses to save a bookmark without a title', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

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
    await panel.ensureAtRoot();

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

test.describe('Bookmark selection', () => {
  /** One folder per test: they share a worker profile, so names must not collide. */
  const openSelectionFolder = async (panel: BookmarksPanel) => {
    const folderName = `${SELECTION_FOLDER}: ${test.info().title}`;
    await seedFolderWithBookmarks(panel.page, folderName, SELECTION_BOOKMARKS);
    await panel.ensureAtRoot();
    await panel.openFolder(folderName, SELECTION_TITLES);
    return folderName;
  };

  test('deletes only the selected rows a filter left visible', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openSelectionFolder(panel);

    await fillSearchInput(bookmarksPage, 'Alpha');
    await expect
      .poll(() => panel.getBookmarkTitles())
      .toEqual(['Alpha One', 'Alpha Two']);

    await panel.selectBookmark('Alpha One');
    await panel.selectBookmark('Alpha Two', { extend: true });
    await panel.openBookmarkContextMenuItem('Alpha Two', 'delete-all');

    await expect.poll(() => panel.getBookmarkTitles()).toEqual([]);
    await clearSearchInput(bookmarksPage);
    // Deliberately not saved: the deletion stays local to this page
    await expect
      .poll(() => panel.getBookmarkTitles())
      .toEqual(['Beta One', 'Beta Two']);
  });

  test('opens only the selected rows a filter left visible', async ({
    bookmarksPage,
    context,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openSelectionFolder(panel);

    await fillSearchInput(bookmarksPage, 'Beta');
    await panel.selectBookmark('Beta One');
    await panel.selectBookmark('Beta Two', { extend: true });

    const pagesBefore = new Set(context.pages());
    try {
      await recordCreatedTabs(bookmarksPage);
      await panel.openBookmarkContextMenuItem('Beta Two', 'open');

      await expect
        .poll(() => getRecordedTabs(bookmarksPage))
        .toEqual([
          { url: `${TEST_SITES.EXAMPLE_COM}/beta-one`, active: false },
          { url: `${TEST_SITES.EXAMPLE_COM}/beta-two`, active: false },
        ]);
    } finally {
      await Promise.all(
        context
          .pages()
          .filter((page) => !pagesBefore.has(page))
          .map((page) => page.close())
      );
    }
  });

  test('holds a noncontiguous selection and drops rows on a second click', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openSelectionFolder(panel);

    await panel.selectBookmark('Alpha One');
    await panel.selectBookmark('Alpha Two', { extend: true });
    await expect(panel.getBookmarkRow('Beta One')).toHaveAttribute(
      'data-is-selected',
      'false'
    );

    await panel.openBookmarkContextMenu('Alpha Two');
    await expect(panel.getContextMenu()).toMatchAriaSnapshot(`
      - menu:
        - /children: equal
        - menuitem "Open all (2) in new tab"
        - menuitem "Cut"
        - menuitem "Delete All"
    `);
    await bookmarksPage.keyboard.press('Escape');

    await panel
      .getBookmarkElement('Alpha Two')
      .click({ modifiers: ['ControlOrMeta'] });
    await expect(panel.getBookmarkRow('Alpha Two')).toHaveAttribute(
      'data-is-selected',
      'false'
    );

    await panel.openBookmarkContextMenu('Alpha One');
    await expect(panel.getContextMenu()).toMatchAriaSnapshot(`
      - menu:
        - /children: equal
        - menuitem "Open in new tab"
        - menuitem "Cut"
        - menuitem "Edit"
        - menuitem "Delete"
    `);
    await bookmarksPage.keyboard.press('Escape');
  });

  test('drops the selection when the folder changes', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    const folderName = await openSelectionFolder(panel);

    await panel.selectBookmark('Alpha One');
    await panel.selectBookmark('Alpha Two', { extend: true });

    await panel.navigateBack();
    await panel.openFolder(folderName, SELECTION_TITLES);

    for (const title of SELECTION_TITLES) {
      await expect(panel.getBookmarkRow(title)).toHaveAttribute(
        'data-is-selected',
        'false'
      );
    }
  });

  test('pastes the cut row above a filtered target and leaves the rest in order', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openSelectionFolder(panel);

    await fillSearchInput(bookmarksPage, 'Beta');
    await panel.moveBookmarkOnto('Beta Two', 'Beta One');

    await expect
      .poll(() => panel.getBookmarkTitles())
      .toEqual(['Beta Two', 'Beta One']);

    await clearSearchInput(bookmarksPage);
    await expect
      .poll(() => panel.getBookmarkTitles())
      .toEqual(['Alpha One', 'Beta Two', 'Beta One', 'Alpha Two']);
  });
});
