import {
  EStorageKey,
  getDecodedFolderList,
  type IBookmarksObj,
  ROOT_FOLDER_ID,
} from '@bypass/shared';
import {
  TEST_BOOKMARKS,
  TEST_BOOKMARK_URLS,
  TEST_FOLDERS,
  TEST_FOLDER_BOOKMARKS,
  TEST_PERSONS,
  TEST_SITES,
  clearSearchInput,
  clickDropdownPersonAndGetName,
  fillSearchInput,
  openNewPageFromAction,
} from '@bypass/shared/tests';

import { bookmarkTest as test, expect } from '../fixtures/panel-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PersonsPanel } from '../utils/persons-panel';
import {
  getRecordedTabs,
  getStorageItem,
  recordCreatedTabs,
  seedFolderWithBookmarks,
} from '../utils/test-utils';

const ROOT_TITLES = TEST_FOLDER_BOOKMARKS.ROOT;
const NESTED_FOLDER = 'Nested folder';

const readStoredBookmarks = (panel: BookmarksPanel) =>
  getStorageItem<IBookmarksObj>(panel.page, EStorageKey.bookmarks);

const readStoredFolders = async (panel: BookmarksPanel) => {
  const stored = await readStoredBookmarks(panel);
  return getDecodedFolderList(stored?.folderList ?? {});
};

const readDefaultFolderNames = async (panel: BookmarksPanel) =>
  (await readStoredFolders(panel))
    .filter(({ isDefault }) => isDefault)
    .map(({ name }) => name);

test.describe('Bookmarks Panel', () => {
  test.describe('Folder Operations', () => {
    const TEST_FOLDER_NAME = 'E2E Test Folder';
    const TEMP_RENAME_FOLDER = 'Temp Rename Folder';
    const RENAMED_FOLDER = 'Renamed Folder';

    test('should create a new folder', async ({ bookmarksPage }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.createFolder(TEST_FOLDER_NAME);

      await panel.verifyFolderExists(TEST_FOLDER_NAME);
    });

    test('should not open empty folder', async ({ bookmarksPage }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      await panel.verifyEmptyFolderCannotOpen(TEST_FOLDERS.EMPTY, ROOT_TITLES);
    });

    test('should rename a folder and undo', async ({ bookmarksPage }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();
      await panel.createFolder(TEMP_RENAME_FOLDER);

      await test.step('rename', async () => {
        await panel.renameFolder(TEMP_RENAME_FOLDER, RENAMED_FOLDER);

        await panel.verifyFolderExists(RENAMED_FOLDER);
        await panel.verifyFolderNotExists(TEMP_RENAME_FOLDER);
      });

      await test.step('undo the rename', async () => {
        await panel.renameFolder(RENAMED_FOLDER, TEMP_RENAME_FOLDER);

        await panel.verifyFolderExists(TEMP_RENAME_FOLDER);
        await panel.verifyFolderNotExists(RENAMED_FOLDER);
      });
    });
  });

  test.describe('Bookmark CRUD Operations', () => {
    test('should find and select an existing bookmark', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      const bookmark = panel.getBookmarkElement(TEST_BOOKMARKS.REACT_DOCS);
      await expect(bookmark).toContainText(TEST_BOOKMARKS.REACT_DOCS);

      await panel.selectBookmark(TEST_BOOKMARKS.REACT_DOCS);

      await expect(
        panel.getBookmarkRow(TEST_BOOKMARKS.GITHUB)
      ).not.toHaveAttribute('data-is-selected', 'true');
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

    test('should open bookmark in a background tab by double-click', async ({
      bookmarksPage,
      context,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      await recordCreatedTabs(bookmarksPage);
      const newPage = await openNewPageFromAction(context, async () => {
        await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
      });

      await expect
        .poll(() => getRecordedTabs(bookmarksPage))
        .toEqual([{ url: TEST_BOOKMARK_URLS.REACT_DOCS, active: false }]);

      await newPage.close();
    });

    test('should open bookmark in a background tab via context menu', async ({
      bookmarksPage,
      context,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      await recordCreatedTabs(bookmarksPage);
      const contextMenuPage = await openNewPageFromAction(context, () =>
        panel.openBookmarkContextMenuItem(TEST_BOOKMARKS.REACT_DOCS, 'open')
      );

      await expect
        .poll(() => getRecordedTabs(bookmarksPage))
        .toEqual([{ url: TEST_BOOKMARK_URLS.REACT_DOCS, active: false }]);

      await contextMenuPage.close();
    });

    test('should cut and paste bookmark using keyboard shortcuts', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();
      await expect.poll(() => panel.getBookmarkTitles()).toEqual(ROOT_TITLES);

      // One direction only: bookmark-editing.spec owns the reorder matrix via
      // the context menu, and this test exists for the hotkey path
      await panel.selectBookmark(TEST_BOOKMARKS.GITHUB);
      await bookmarksPage.keyboard.press('ControlOrMeta+x');
      await panel.selectBookmark(TEST_BOOKMARKS.REACT_DOCS);
      await bookmarksPage.keyboard.press('ControlOrMeta+v');

      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual([TEST_BOOKMARKS.GITHUB, TEST_BOOKMARKS.REACT_DOCS]);
    });

    test('should open a folder and list only its own bookmarks', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      await panel.openFolder(TEST_FOLDERS.MAIN, TEST_FOLDER_BOOKMARKS.MAIN);
      expect(bookmarksPage.url()).not.toContain(ROOT_FOLDER_ID);

      await panel.navigateBack();
      await expect.poll(() => panel.getBookmarkTitles()).toEqual(ROOT_TITLES);
    });

    test('should delete bookmark via context menu', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();
      await expect.poll(() => panel.getBookmarkTitles()).toEqual(ROOT_TITLES);

      await panel.openBookmarkContextMenuItem(TEST_BOOKMARKS.GITHUB, 'delete');

      // Deliberately not saved: the deletion stays local to this page
      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual([TEST_BOOKMARKS.REACT_DOCS]);
    });

    test('should handle bookmark URL editing with validation', async ({
      bookmarksPage,
      context,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      await panel.openEditBookmarkDialog(TEST_BOOKMARKS.REACT_DOCS);
      const originalUrl = await panel.getUrlInput().inputValue();
      expect(originalUrl).toBe(TEST_BOOKMARK_URLS.REACT_DOCS);
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
        const editedUrl = 'https://www.google.com/';
        await panel.editBookmarkUrl(TEST_BOOKMARKS.REACT_DOCS, editedUrl);

        await recordCreatedTabs(bookmarksPage);
        const newPage = await openNewPageFromAction(context, async () => {
          await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
        });

        await expect
          .poll(() => getRecordedTabs(bookmarksPage))
          .toEqual([{ url: editedUrl, active: false }]);

        await newPage.close();
      });

      await test.step('original url is restored', async () => {
        const restoreDialog = await panel.editBookmarkUrl(
          TEST_BOOKMARKS.REACT_DOCS,
          originalUrl
        );
        await expect(restoreDialog).toBeHidden();

        await panel.openEditBookmarkDialog(TEST_BOOKMARKS.REACT_DOCS);
        await expect(panel.getUrlInput()).toHaveValue(originalUrl);
        await panel.closeDialog();
      });
    });
  });

  test('should open person panel by clicking tagged person avatar', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    const dropdown = await panel.hoverAvatar();

    const personName = await clickDropdownPersonAndGetName(dropdown);

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

    await test.step('the folder is absent from storage until saved', async () => {
      const stored = await readStoredFolders(panel);
      expect(stored.map(({ name }) => name)).not.toContain(folderName);
    });

    await panel.clickSaveButton();

    await test.step('storage holds the folder and its root membership', async () => {
      const folder = (await readStoredFolders(panel)).find(
        ({ name }) => name === folderName
      );
      expect(folder).toBeDefined();
      expect(folder?.parentHash).toBe(ROOT_FOLDER_ID);

      const stored = await readStoredBookmarks(panel);
      expect(
        stored?.folders[ROOT_FOLDER_ID]?.some(
          ({ hash, isDir }) => isDir && hash === folder?.id
        )
      ).toBe(true);
    });

    await test.step('the folder survives reopening the panel', async () => {
      await panel.ensureAtRoot();
      await panel.verifyFolderExists(folderName);
    });
  });

  test('should search bookmarks by title, URL and keep folders visible', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    await test.step('search by title', async () => {
      await fillSearchInput(bookmarksPage, 'ButtonGroup');
      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual([TEST_BOOKMARKS.GITHUB]);
      await clearSearchInput(bookmarksPage);
    });

    await test.step('search by url', async () => {
      await fillSearchInput(bookmarksPage, 'bottom-navigation');
      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual([TEST_BOOKMARKS.REACT_DOCS]);
      await clearSearchInput(bookmarksPage);
    });

    await test.step('folders survive a non-matching search', async () => {
      const foldersBefore = await panel.getFolderNames();
      await fillSearchInput(bookmarksPage, 'nonexistentterm');

      await expect.poll(() => panel.getBookmarkTitles()).toEqual([]);
      expect(await panel.getFolderNames()).toEqual(foldersBefore);

      await clearSearchInput(bookmarksPage);
      await expect.poll(() => panel.getBookmarkTitles()).toEqual(ROOT_TITLES);
    });
  });

  test('should not delete folder with nested folders and show toast', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    await panel.openFolderContextMenu(TEST_FOLDERS.OTHER_BOOKMARKS);
    await panel.clickContextMenuItem('delete');

    const toast = bookmarksPage.getByText('Remove inner folders first');
    await expect(toast).toBeVisible();

    await panel.verifyFolderExists(TEST_FOLDERS.OTHER_BOOKMARKS);
    await panel.openFolder(
      TEST_FOLDERS.OTHER_BOOKMARKS,
      TEST_FOLDER_BOOKMARKS.OTHER_BOOKMARKS
    );
    await panel.verifyFolderExists(NESTED_FOLDER);
  });

  test('should delete a folder', async ({ bookmarksPage }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const folderName = 'Delete Test Folder';
    await panel.createFolder(folderName);

    await panel.openFolderContextMenu(folderName);
    await panel.clickContextMenuItem('delete');

    await panel.verifyFolderNotExists(folderName);
  });

  test('should save via Cmd+S while focus is in the search input', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const folderName = 'Cmd S Save Test Folder';
    await panel.createFolder(folderName);

    const search = panel.getSearchInput();
    await search.click();
    await expect(search).toBeFocused();

    await bookmarksPage.keyboard.press('ControlOrMeta+s');

    await expect(bookmarksPage.getByText('Saved temporarily')).toBeVisible();
    await expect(panel.getSaveButton()).toBeDisabled();

    const stored = await readStoredFolders(panel);
    expect(stored.map(({ name }) => name)).toContain(folderName);

    await panel.ensureAtRoot();
    await panel.verifyFolderExists(folderName);
  });

  test('keeps a single default folder, including one set in another folder', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    await test.step('marking a root folder default', async () => {
      await panel.setFolderDefault(TEST_FOLDERS.MAIN, true);
      await panel.clickSaveButton();

      await expect
        .poll(() => readDefaultFolderNames(panel))
        .toEqual([TEST_FOLDERS.MAIN]);
    });

    await test.step('a folder in another folder takes the flag over', async () => {
      await panel.openFolder(
        TEST_FOLDERS.OTHER_BOOKMARKS,
        TEST_FOLDER_BOOKMARKS.OTHER_BOOKMARKS
      );
      await panel.setFolderDefault(NESTED_FOLDER, true);
      await panel.clickSaveButton();

      await expect
        .poll(() => readDefaultFolderNames(panel))
        .toEqual([NESTED_FOLDER]);
    });

    await test.step('removing the default leaves none behind', async () => {
      await panel.setFolderDefault(NESTED_FOLDER, false);
      await panel.clickSaveButton();

      await expect.poll(() => readDefaultFolderNames(panel)).toEqual([]);
    });
  });

  test('deletes the bookmarks a folder holds along with it', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const folderName = 'Folder With Bookmarks';
    const bookmarkTitle = 'Bookmark Inside Deleted Folder';
    const { folderId, bookmarkIds } = await seedFolderWithBookmarks(
      bookmarksPage,
      folderName,
      [
        {
          title: bookmarkTitle,
          url: `${TEST_SITES.EXAMPLE_COM}/deleted-folder`,
        },
      ]
    );
    await panel.ensureAtRoot();
    await panel.openFolder(folderName, [bookmarkTitle]);
    await panel.navigateBack();

    await panel.openFolderContextMenu(folderName);
    await panel.clickContextMenuItem('delete');
    await panel.verifyFolderNotExists(folderName);
    await panel.clickSaveButton();

    const stored = await readStoredBookmarks(panel);
    expect(stored?.urlList[bookmarkIds[0]]).toBeUndefined();
    expect(stored?.folderList[folderId]).toBeUndefined();
    expect(stored?.folders[folderId]).toBeUndefined();
    expect(
      stored?.folders[ROOT_FOLDER_ID]?.some(({ hash }) => hash === folderId)
    ).toBe(false);
  });

  test('moves a bookmark to the folder picked in the edit dialog', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const sourceFolder = 'Move Source Folder';
    const destinationFolder = 'Move Destination Folder';
    const bookmarkTitle = 'Bookmark On The Move';
    const { folderId: sourceId, bookmarkIds } = await seedFolderWithBookmarks(
      bookmarksPage,
      sourceFolder,
      [{ title: bookmarkTitle, url: `${TEST_SITES.EXAMPLE_COM}/moved` }]
    );
    const { folderId: destinationId } = await seedFolderWithBookmarks(
      bookmarksPage,
      destinationFolder,
      [
        {
          title: 'Bookmark Already There',
          url: `${TEST_SITES.EXAMPLE_COM}/kept`,
        },
      ]
    );

    await panel.ensureAtRoot();
    await panel.openFolder(sourceFolder, [bookmarkTitle]);
    await panel.moveBookmarkToFolder(bookmarkTitle, destinationFolder);
    await expect.poll(() => panel.getBookmarkTitles()).toEqual([]);
    await panel.clickSaveButton();

    const stored = await readStoredBookmarks(panel);
    const [bookmarkId] = bookmarkIds;
    expect(stored?.urlList[bookmarkId]?.parentHash).toBe(destinationId);
    expect(stored?.folders[sourceId]?.map(({ hash }) => hash)).toEqual([]);
    expect(stored?.folders[destinationId]?.map(({ hash }) => hash)).toContain(
      bookmarkId
    );

    await panel.ensureAtRoot();
    await panel.openFolder(destinationFolder, [
      'Bookmark Already There',
      bookmarkTitle,
    ]);
  });

  test('prompts before leaving an unsaved bookmark edit', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const editedTitle = 'Unsaved Title Edit';
    const dialog = await panel.openEditBookmarkDialog(TEST_BOOKMARKS.GITHUB);
    await dialog.getByTestId('bookmark-title-input').fill(editedTitle);
    await dialog.getByTestId('dialog-save-button').click();
    await expect(dialog).toBeHidden();
    await panel.verifyBookmarkExists(editedTitle);

    const confirmation = bookmarksPage.getByRole('dialog', {
      name: 'There are some unsaved changes',
    });

    await panel.navigateBack();
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: 'Cancel' }).click();

    await expect(confirmation).toBeHidden();
    await panel.verifyBookmarkExists(editedTitle);
    await expect(panel.getSaveButton()).toBeEnabled();

    await panel.navigateBack();
    await confirmation.getByRole('button', { name: 'Discard' }).click();

    await expect(bookmarksPage.getByTestId('home-popup-heading')).toBeVisible();
    await panel.ensureAtRoot();
    await expect.poll(() => panel.getBookmarkTitles()).toEqual(ROOT_TITLES);
  });

  test('the save shortcut skips an unfinished dialog', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const folderName = 'Shortcut Save Folder';
    const unfinishedName = 'Never Saved Folder';
    await panel.createFolder(folderName);

    const dialog = await panel.openAddFolderDialog();
    await dialog.getByTestId('folder-name-input').fill(unfinishedName);
    await bookmarksPage.keyboard.press('ControlOrMeta+s');

    await expect(dialog).toBeVisible();
    await expect(bookmarksPage.getByText('Saved temporarily')).toBeHidden();
    await panel.closeDialog();

    await bookmarksPage.keyboard.press('ControlOrMeta+s');
    await expect(bookmarksPage.getByText('Saved temporarily')).toBeVisible();

    const storedNames = (await readStoredFolders(panel)).map(
      ({ name }) => name
    );
    expect(storedNames).toContain(folderName);
    expect(storedNames).not.toContain(unfinishedName);

    // Reopening the popup: the save has to outlive this page
    await panel.ensureAtRoot();
    await panel.verifyFolderExists(folderName);
    await panel.verifyFolderNotExists(unfinishedName);
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
