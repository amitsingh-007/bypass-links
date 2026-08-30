import {
  TEST_BOOKMARKS,
  TEST_FOLDERS,
  TEST_PERSONS,
  clearSearchInput,
  fillSearchInput,
  openNewPageFromAction,
} from '@bypass/shared/tests';

import { bookmarkTest as test, expect } from '../fixtures/panel-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PersonsPanel } from '../utils/persons-panel';

test.describe('Bookmarks Panel', () => {
  test.describe('Folder Operations', () => {
    const TEST_FOLDER_NAME = 'E2E Test Folder';
    const TEMP_RENAME_FOLDER = 'Temp Rename Folder';

    test('should create a new folder', async ({ bookmarksPage }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.createFolder(TEST_FOLDER_NAME);

      await panel.verifyFolderExists(TEST_FOLDER_NAME);
    });

    test('should not open empty folder (or show empty state)', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      const emptyFolderName = 'Empty folder';
      const initialUrl = bookmarksPage.url();

      await panel.openFolder(emptyFolderName);

      expect(bookmarksPage.url()).toBe(initialUrl);
    });

    test('should rename a folder and undo', async ({ bookmarksPage }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.createFolder(TEMP_RENAME_FOLDER);

      await panel.verifyFolderExists(TEMP_RENAME_FOLDER);
    });
  });

  test.describe('Bookmark CRUD Operations', () => {
    test('should find and select an existing bookmark', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      const bookmark = panel.getBookmarkElement(TEST_BOOKMARKS.REACT_DOCS);
      await expect(bookmark).toBeVisible();

      const title = (await bookmark.textContent()) ?? '';
      expect(title).not.toBe('');
      expect(title).toContain(TEST_BOOKMARKS.REACT_DOCS);

      await bookmark.click();
    });

    test('should open edit dialog with all UI elements visible', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      const dialog = await panel.openEditBookmarkDialog(
        TEST_BOOKMARKS.REACT_DOCS
      );
      await expect(dialog).toBeVisible();

      const titleInput = dialog.getByTestId('bookmark-title-input');
      await expect(titleInput).toBeVisible();
      const currentTitle = await titleInput.inputValue();
      expect(currentTitle).not.toBe('');

      const personLabel = dialog.getByText('Tagged Persons');
      await expect(personLabel).toBeVisible();

      await panel.closeDialog();
      await expect(dialog).toBeHidden();
    });

    test('should focus the title input with caret at start when opening the edit modal', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      const dialog = await panel.openEditBookmarkDialog(
        TEST_BOOKMARKS.REACT_DOCS
      );
      const titleInput = dialog.getByTestId('bookmark-title-input');
      await expect(titleInput).toHaveValue(TEST_BOOKMARKS.REACT_DOCS);
      await expect(titleInput).toBeFocused();

      const selection = await titleInput.evaluate((el) => ({
        start: (el as HTMLInputElement).selectionStart,
        end: (el as HTMLInputElement).selectionEnd,
      }));
      expect(selection.start).toBe(0);
      expect(selection.end).toBe(0);

      await panel.closeDialog();
    });

    test('should add and remove person tag from bookmark', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      const personsPanel = new PersonsPanel(bookmarksPage);

      await test.step('tag the bookmark', async () => {
        await panel.ensureAtRoot();
        await panel.openFolder(TEST_FOLDERS.MAIN);
        await panel.addPersonToBookmark(
          TEST_BOOKMARKS.REACT_DOCS,
          TEST_PERSONS.JOHN_NATHAN
        );
      });

      await test.step('tag shows in persons panel', async () => {
        await panel.navigateToPersonsPanel();
        await personsPanel.verifyBookmarkInPersonList(
          TEST_PERSONS.JOHN_NATHAN,
          TEST_BOOKMARKS.REACT_DOCS
        );
      });

      await test.step('untag the bookmark', async () => {
        await panel.ensureAtRoot();
        await panel.openFolder(TEST_FOLDERS.MAIN);
        await panel.removePersonFromBookmark(
          TEST_BOOKMARKS.REACT_DOCS,
          TEST_PERSONS.JOHN_NATHAN
        );
      });

      await test.step('tag is gone from persons panel', async () => {
        await panel.navigateToPersonsPanel();
        await personsPanel.verifyBookmarkNotInPersonList(
          TEST_PERSONS.JOHN_NATHAN,
          TEST_BOOKMARKS.REACT_DOCS
        );
      });

      await panel.ensureAtRoot();
    });

    test('should open bookmark by double-click', async ({
      bookmarksPage,
      context,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);

      const newPage = await openNewPageFromAction(context, async () => {
        await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
      });
      await newPage.close();
    });

    test('should open bookmark via context menu', async ({
      bookmarksPage,
      context,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      const contextMenuPage = await openNewPageFromAction(context, () =>
        panel.openBookmarkContextMenuItem(TEST_BOOKMARKS.REACT_DOCS, 'open')
      );
      await contextMenuPage.close();
    });

    test('should cut and paste bookmark using keyboard shortcuts', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.selectBookmark(TEST_BOOKMARKS.REACT_DOCS);

      await bookmarksPage.keyboard.press('Meta+x');
      await bookmarksPage.keyboard.press('Meta+v');

      await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);
    });

    test('should open folder with at least one bookmark', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.openFolder('Main');

      const bookmarkCount = await panel.getBookmarkCount();

      expect(bookmarkCount).toBeGreaterThanOrEqual(1);
    });

    test('should delete bookmark via context menu', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      const bookmarkRows = panel.getBookmarkItems();
      const bookmarksBefore = await bookmarkRows.count();

      const lastBookmark = bookmarkRows.last();
      await lastBookmark.click({ button: 'right' });

      await panel.clickContextMenuItem('delete');

      await expect(bookmarkRows).toHaveCount(bookmarksBefore - 1);
    });

    test('should handle bookmark URL editing with validation', async ({
      bookmarksPage,
      context,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();
      await panel.openFolder(TEST_FOLDERS.MAIN);

      await panel.openEditBookmarkDialog(TEST_BOOKMARKS.REACT_DOCS);
      const originalUrl = await panel.getUrlInput().inputValue();
      await panel.closeDialog();

      await panel.openEditBookmarkDialog(TEST_BOOKMARKS.GITHUB);
      const existingUrl = await panel.getUrlInput().inputValue();
      await panel.closeDialog();

      await test.step('duplicate url is rejected', async () => {
        const duplicateDialog = await panel.editBookmarkUrl(
          TEST_BOOKMARKS.REACT_DOCS,
          existingUrl
        );
        await panel.verifyErrorNotification(
          'A bookmark with this URL already exists'
        );
        await expect(duplicateDialog).toBeVisible();
        await panel.closeDialog();
      });

      await test.step('edited url opens the new site', async () => {
        const google = 'https://www.google.com/';
        await context.route(`${google}**`, async (route) => {
          await route.fulfill({ contentType: 'text/html', body: '' });
        });

        try {
          await panel.editBookmarkUrl(TEST_BOOKMARKS.REACT_DOCS, google);

          const newPage = await openNewPageFromAction(context, async () => {
            await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
          });
          expect(newPage.url()).toBe(google);
          await newPage.close();
        } finally {
          await context.unroute(`${google}**`);
        }
      });

      await test.step('original url is restored', async () => {
        const restoreDialog = await panel.editBookmarkUrl(
          TEST_BOOKMARKS.REACT_DOCS,
          originalUrl
        );
        await expect(restoreDialog).toBeHidden();

        await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);
      });
    });
  });

  test('should open person panel by clicking tagged person avatar', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    const { dropdown } = await panel.hoverAvatar();

    const personName = await panel.clickPersonInDropdown(dropdown);

    await bookmarksPage.waitForURL(/persons-panel/);
    const url = bookmarksPage.url();
    expect(url).toContain('persons-panel');
    expect(url).toContain('openBookmarksList=');

    const badgeCount = await panel.getBadgeCount(personName);
    expect(badgeCount).toBeGreaterThan(0);

    const editButtons = await panel.getEditButtons();
    const rowCount = await editButtons.count();
    expect(rowCount).toBeGreaterThan(0);
    await expect(editButtons.first()).toBeVisible();

    await panel.navigateBack();
  });

  test('should save changes and verify in extension storage', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const folderName = 'Persistence Save Test Folder';
    await panel.createFolder(folderName);

    await panel.clickSaveButton();

    await panel.verifyFolderExists(folderName);
  });

  test('should search bookmarks by title, URL and keep folders visible', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();
    await panel.openFolder(TEST_FOLDERS.MAIN);

    await test.step('search by title', async () => {
      await fillSearchInput(bookmarksPage, 'ButtonGroup');
      await expect(
        panel.getBookmarkElement(TEST_BOOKMARKS.GITHUB)
      ).toBeVisible();
      await clearSearchInput(bookmarksPage);
    });

    await test.step('search by url', async () => {
      await fillSearchInput(bookmarksPage, 'material');
      await expect(
        panel.getBookmarkElement(TEST_BOOKMARKS.REACT_DOCS)
      ).toBeVisible();
      await clearSearchInput(bookmarksPage);
    });

    await test.step('folders survive a non-matching search', async () => {
      await panel.ensureAtRoot();
      const folder = panel.getFolderElement(TEST_FOLDERS.MAIN);
      await expect(folder).toBeVisible();
      await fillSearchInput(bookmarksPage, 'nonexistentterm');
      await expect(folder).toBeVisible();
      await clearSearchInput(bookmarksPage);
    });
  });

  test('should move bookmark using cut from context menu and paste', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const mainFolder = panel.getFolderElement(TEST_FOLDERS.MAIN);
    await expect(mainFolder).toBeVisible();
    await mainFolder.click();

    const countBefore = await panel.getBookmarkCount();

    await panel.cutBookmark(TEST_BOOKMARKS.GITHUB);

    await panel.verifyBookmarkExists(TEST_BOOKMARKS.GITHUB);

    const firstBookmark = panel.getBookmarkItems().first();
    await expect(firstBookmark).toBeVisible();
    await firstBookmark.click();
    await firstBookmark.click({ button: 'right' });

    await panel.pasteBookmark();

    await panel.verifyBookmarkExists(TEST_BOOKMARKS.GITHUB);

    const countAfter = await panel.getBookmarkCount();
    expect(countAfter).toBe(countBefore);
  });

  test('should not delete folder with nested folders and show toast', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    await panel.openFolderWithNestedFolders(TEST_FOLDERS.OTHER_BOOKMARKS);
    await panel.clickContextMenuItem('delete');

    const toast = bookmarksPage.getByText('Remove inner folders first');
    await expect(toast).toBeVisible();

    await panel.verifyFolderExists(TEST_FOLDERS.OTHER_BOOKMARKS);
  });

  test('should delete a folder', async ({ bookmarksPage }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const folderName = 'Delete Test Folder';
    await panel.createFolder(folderName);

    const folderRow = panel.getFolderElement(folderName);
    await expect(folderRow).toBeVisible();

    await folderRow.click({ button: 'right' });

    await panel.clickContextMenuItem('delete');

    await panel.verifyFolderNotExists(folderName);
  });

  test('should save via Cmd+S while focus is in the search input', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    // Create a pending change so the Save button is active
    await panel.createFolder('Cmd S Save Test Folder');

    const search = panel.getSearchInput();
    await search.click();
    await expect(search).toBeFocused();

    await bookmarksPage.keyboard.press('ControlOrMeta+s');

    await expect(bookmarksPage.getByText('Saved temporarily')).toBeVisible();
  });

  test('should not throw when navigating back out of the panel', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const pageErrors: string[] = [];
    const onPageError = (error: Error) => pageErrors.push(error.message);
    bookmarksPage.on('pageerror', onPageError);

    try {
      await panel.navigateBack();
      await expect(
        bookmarksPage.getByTestId('home-popup-heading')
      ).toBeVisible();
      expect(pageErrors).toEqual([]);
    } finally {
      bookmarksPage.off('pageerror', onPageError);
    }

    await panel.ensureAtRoot();
  });
});
