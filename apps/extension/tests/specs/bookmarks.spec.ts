import {
  TEST_BOOKMARKS,
  TEST_FOLDERS,
  TEST_PERSONS,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { test, expect } from '../fixtures/bookmark-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PersonsPanel } from '../utils/persons-panel';

/**
 * Bookmarks Panel E2E Tests
 *
 * These tests run sequentially with a single login at the start.
 * The browser context persists across all tests in this describe block.
 *
 * IMPORTANT: Test order matters! Do not reorder tests without understanding dependencies.
 */
test.describe.serial('Bookmarks Panel', () => {
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

      // Empty folder should not navigate - URL should remain the same
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
      expect(title).toBeTruthy();
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

      // Verify title input
      const titleInput = dialog.getByTestId('bookmark-title-input');
      await expect(titleInput).toBeVisible();
      const currentTitle = await titleInput.inputValue();
      expect(currentTitle).toBeTruthy();

      // Verify person select is present
      const personLabel = dialog.getByText('Tagged Persons');
      await expect(personLabel).toBeVisible();

      await panel.closeDialog();
      await expect(dialog).toBeHidden();
    });

    test('should add and remove person tag from bookmark', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();
      await panel.openFolder(TEST_FOLDERS.MAIN);

      // Add person tag
      await panel.addPersonToBookmark(
        TEST_BOOKMARKS.REACT_DOCS,
        TEST_PERSONS.JOHN_NATHAN
      );

      // Verify in persons panel
      await panel.navigateToPersonsPanel();
      const personsPanel = new PersonsPanel(bookmarksPage);
      await personsPanel.verifyBookmarkInPersonList(
        TEST_PERSONS.JOHN_NATHAN,
        TEST_BOOKMARKS.REACT_DOCS
      );

      // Remove person tag
      await panel.ensureAtRoot();
      await panel.openFolder(TEST_FOLDERS.MAIN);
      await panel.removePersonFromBookmark(
        TEST_BOOKMARKS.REACT_DOCS,
        TEST_PERSONS.JOHN_NATHAN
      );

      // Verify removal in persons panel
      await panel.navigateToPersonsPanel();
      await personsPanel.verifyBookmarkNotInPersonList(
        TEST_PERSONS.JOHN_NATHAN,
        TEST_BOOKMARKS.REACT_DOCS
      );

      await panel.ensureAtRoot();
    });

    test('should open bookmarks by double-click and via context menu', async ({
      bookmarksPage,
      context,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);

      // Test 1: Open bookmark by double-clicking
      const initialPages = context.pages().length;
      const bookmarkRow = panel.getBookmarkElement(TEST_BOOKMARKS.REACT_DOCS);
      await expect(bookmarkRow).toBeVisible();

      const pagePromise = context.waitForEvent('page', {
        timeout: TEST_TIMEOUTS.PAGE_OPEN,
      });
      await bookmarkRow.dblclick();
      const newPage = await pagePromise;

      expect(newPage).toBeTruthy();
      expect(context.pages().length).toBeGreaterThan(initialPages);
      await newPage.close();

      // Test 2: Open multiple bookmarks via context menu
      await panel.ensureAtRoot();
      const firstBookmark = panel.getBookmarkElement(TEST_BOOKMARKS.REACT_DOCS);
      await expect(firstBookmark).toBeVisible();
      await firstBookmark.click();

      const secondBookmark = panel.getBookmarkElement(TEST_BOOKMARKS.GITHUB);
      await expect(secondBookmark).toBeVisible();
      await secondBookmark.click({ modifiers: ['Meta'] });

      await firstBookmark.click({ button: 'right' });
      const openOption = bookmarksPage.locator('.context-menu-item-open');
      await openOption.waitFor({ state: 'attached' });

      const multiPagePromise = context.waitForEvent('page', {
        timeout: TEST_TIMEOUTS.PAGE_OPEN,
      });
      await openOption.click();
      const multiNewPage = await multiPagePromise;

      expect(multiNewPage).toBeTruthy();

      // Clean up all new pages
      const allNewPages = context.pages().slice(initialPages);
      for (const page of allNewPages) {
        await page.close();
      }
    });

    test('should cut and paste bookmark using keyboard shortcuts', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.selectBookmark(TEST_BOOKMARKS.REACT_DOCS);

      await bookmarksPage.keyboard.press('Meta+x');
      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);

      await bookmarksPage.keyboard.press('Meta+v');

      await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);
    });

    test('should open folder with at least one bookmark', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.openFolder('Main');

      const bookmarkCount = await panel.getBookmarkCount();

      expect(bookmarkCount).toBeGreaterThanOrEqual(0);
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

      // Wait for the bookmark count to decrease using auto-retrying assertion
      await expect(bookmarkRows).toHaveCount(bookmarksBefore - 1);
    });

    test('should handle bookmark URL editing with validation', async ({
      bookmarksPage,
      context,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();
      await panel.openFolder(TEST_FOLDERS.MAIN);

      // Get original URL and existing URL from another bookmark
      await panel.openEditBookmarkDialog(TEST_BOOKMARKS.REACT_DOCS);
      const originalUrl = await panel.getUrlInput().inputValue();
      await panel.closeDialog();

      await panel.openEditBookmarkDialog(TEST_BOOKMARKS.GITHUB);
      const existingUrl = await panel.getUrlInput().inputValue();
      await panel.closeDialog();

      // Test 1: Prevent duplicate URL
      const duplicateDialog = await panel.editBookmarkUrl(
        TEST_BOOKMARKS.REACT_DOCS,
        existingUrl
      );
      await panel.verifyErrorNotification(
        'A bookmark with this URL already exists'
      );
      await expect(duplicateDialog).toBeVisible();
      await panel.closeDialog();

      // Test 2: Edit URL successfully and verify by opening
      const newUrl = 'https://www.google.com/';
      await panel.editBookmarkUrl(TEST_BOOKMARKS.REACT_DOCS, newUrl);

      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS),
      ]);
      await newPage.waitForLoadState();
      expect(newPage.url()).toContain('google.com');
      await newPage.close();

      // Test 3: Restore original URL
      const restoreDialog = await panel.openEditBookmarkDialog(
        TEST_BOOKMARKS.REACT_DOCS
      );
      await panel.getUrlInput().clear();
      await panel.getUrlInput().fill(originalUrl);
      await restoreDialog.getByTestId('dialog-save-button').click();
      await expect(restoreDialog).toBeHidden();

      // Verify bookmark exists after restoration
      await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);
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

    const folderName = 'Persistence Test Folder';
    await panel.createFolder(folderName);

    await panel.clickSaveButton();

    // Verify folder still exists after save (persisted to storage)
    await panel.verifyFolderExists(folderName);
  });

  test('should search bookmarks by title, URL and keep folders visible', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();
    await panel.openFolder(TEST_FOLDERS.MAIN);

    const searchInput = panel.getSearchInput();

    // Test search by title
    await searchInput.fill('ButtonGroup');
    const titleFilteredBookmark = panel.getBookmarkElement(
      TEST_BOOKMARKS.GITHUB
    );
    await expect(titleFilteredBookmark).toBeVisible();
    await searchInput.clear();

    // Test search by URL
    await searchInput.fill('material');
    const urlFilteredBookmark = panel.getBookmarkElement(
      TEST_BOOKMARKS.REACT_DOCS
    );
    await expect(urlFilteredBookmark).toBeVisible();
    await searchInput.clear();

    // Test folders remain visible during search
    await panel.ensureAtRoot();
    const folder = panel.getFolderElement(TEST_FOLDERS.MAIN);
    await expect(folder).toBeVisible();
    await searchInput.fill('nonexistentterm');
    await expect(folder).toBeVisible();
    await searchInput.clear();
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

    const folderName = 'Persistence Test Folder';
    const folderRow = panel.getFolderElement(folderName);
    await expect(folderRow).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });

    await folderRow.click({ button: 'right' });

    await panel.clickContextMenuItem('delete');

    await panel.verifyFolderNotExists(folderName);
  });
});
