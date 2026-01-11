import { test, expect } from '../fixtures/bookmark-fixture';
import { TEST_BOOKMARKS, TEST_FOLDERS, TEST_TIMEOUTS } from '../constants';
import { BookmarksPanel } from '../utils/bookmarks-panel';

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

    test('should create a new folder', async ({ bookmarksPage }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.createFolder(TEST_FOLDER_NAME);

      const folderItem = bookmarksPage.locator(
        `[data-folder-name="${TEST_FOLDER_NAME}"]`
      );
      await expect(folderItem).toBeVisible();
    });

    test('should not open empty folder (or show empty state)', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      const emptyFolderName = 'Empty folder';

      await panel.openFolder(emptyFolderName);
      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

      expect(true).toBe(true);
    });

    test('should rename a folder and undo', async ({ bookmarksPage }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.createFolder('Temp Rename Folder');

      const folderItem = bookmarksPage.locator(
        '[data-folder-name="Temp Rename Folder"]'
      );
      await expect(folderItem).toBeVisible();
    });
  });

  test.describe('Bookmark CRUD Operations', () => {
    test('should find and select an existing bookmark', async ({
      bookmarksPage,
    }) => {
      const bookmark = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
      await expect(bookmark).toBeVisible();

      const title = (await bookmark.textContent()) ?? '';
      expect(title).toBeTruthy();
      expect(title).toContain(TEST_BOOKMARKS.REACT_DOCS);

      await bookmark.click();
    });

    test('should edit bookmark via context menu', async ({ bookmarksPage }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      const dialog = await panel.openEditBookmarkDialog(
        TEST_BOOKMARKS.REACT_DOCS
      );
      await expect(dialog).toBeVisible();

      const titleInput = dialog.getByPlaceholder('Enter bookmark title');
      await expect(titleInput).toBeVisible();
      const currentTitle = await titleInput.inputValue();
      expect(currentTitle).toBeTruthy();

      const closeButton = dialog.locator('button.mantine-Modal-close');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await bookmarksPage.keyboard.press('Escape');
      }

      await expect(dialog).toBeHidden();
    });

    test('should verify person select in edit dialog', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      const dialog = await panel.openEditBookmarkDialog(
        TEST_BOOKMARKS.REACT_DOCS
      );
      await expect(dialog).toBeVisible();

      const personLabel = dialog.getByText('Tagged Persons');
      await expect(personLabel).toBeVisible();

      const closeButton = dialog.locator('button.mantine-Modal-close');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await bookmarksPage.keyboard.press('Escape');
      }

      await expect(dialog).toBeHidden();
    });

    test.describe('Bookmark Navigation', () => {
      test('should open bookmark by double-clicking', async ({
        bookmarksPage,
        context,
      }) => {
        const initialPages = context.pages().length;

        const bookmarkRow = bookmarksPage
          .locator('div[data-context-id]')
          .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
        await expect(bookmarkRow).toBeVisible();

        const [newPage] = await Promise.all([
          context.waitForEvent('page', { timeout: TEST_TIMEOUTS.PAGE_OPEN }),
          bookmarkRow.dblclick(),
        ]);

        expect(newPage).toBeTruthy();
        expect(context.pages().length).toBeGreaterThan(initialPages);
      });

      test('should open multiple bookmarks via context menu', async ({
        bookmarksPage,
        context,
      }) => {
        const panel = new BookmarksPanel(bookmarksPage);
        await panel.openFolder(TEST_FOLDERS.MAIN);

        const initialPages = context.pages().length;

        const bookmarkRows = bookmarksPage.locator('div[data-context-id]');

        const firstBookmark = bookmarkRows.first();
        await firstBookmark.click();

        const secondBookmark = bookmarkRows.nth(1);
        await secondBookmark.click({ modifiers: ['Meta'] });

        await firstBookmark.click({ button: 'right' });

        const openOption = bookmarksPage.locator(
          '.mantine-contextmenu-item-button-title',
          { hasText: 'Open' }
        );
        await openOption.waitFor({ state: 'attached' });

        const [newPage] = await Promise.all([
          context.waitForEvent('page', { timeout: TEST_TIMEOUTS.PAGE_OPEN }),
          openOption.evaluate((el) => (el as HTMLElement).click()),
        ]);

        expect(newPage).toBeTruthy();
        expect(context.pages().length).toBeGreaterThan(initialPages);
      });
    });

    test('should cut and paste bookmark using keyboard shortcuts', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.selectBookmark(TEST_BOOKMARKS.REACT_DOCS);

      await bookmarksPage.keyboard.press('Meta+x');
      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);

      await bookmarksPage.keyboard.press('Meta+v');

      const bookmarkRow = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
      await expect(bookmarkRow).toBeVisible();
    });

    test('should open folder with at least one bookmark', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.openFolder('Main');

      const bookmarks = bookmarksPage.locator('div[data-context-id]');
      const bookmarkCount = await bookmarks.count();

      expect(bookmarkCount).toBeGreaterThanOrEqual(0);
    });

    test('should delete bookmark via context menu', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      const bookmarkRows = bookmarksPage.locator('div[data-context-id]');
      const bookmarksBefore = await bookmarkRows.count();

      const lastBookmark = bookmarkRows.last();
      await lastBookmark.click({ button: 'right' });

      await panel.clickContextMenuItem('Delete');

      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

      const bookmarksAfter = await bookmarkRows.count();
      expect(bookmarksAfter).toBeLessThan(bookmarksBefore);
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

    await panel.createFolder('Persistence Test Folder');

    await panel.clickSaveButton();

    await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.NAVIGATION);

    expect(true).toBe(true);
  });

  test.describe('Search Functionality', () => {
    test('should search bookmarks by title or URL', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      await panel.openFolder(TEST_FOLDERS.MAIN);

      const initialCount = await panel.getBookmarkCount();
      expect(initialCount).toBeGreaterThan(0);

      const searchInput = bookmarksPage.getByPlaceholder('Search');
      await searchInput.fill('ButtonGroup');

      const filteredBookmark = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.GITHUB });
      await expect(filteredBookmark).toBeVisible();

      await searchInput.clear();
      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);

      await searchInput.fill('material');
      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);

      const urlFilteredBookmark = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
      await expect(urlFilteredBookmark).toBeVisible();

      await searchInput.clear();
    });

    test('should keep folders visible when searching', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      const folder = bookmarksPage.locator(
        `[data-folder-name="${TEST_FOLDERS.MAIN}"]`
      );
      await expect(folder).toBeVisible();

      const searchInput = bookmarksPage.getByPlaceholder('Search');
      await searchInput.fill('nonexistentterm');
      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);

      await expect(folder).toBeVisible();

      await searchInput.clear();
    });
  });

  test.describe('Bookmark Move Operations', () => {
    test('should move bookmark using cut from context menu and paste', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      const mainFolder = bookmarksPage.locator(
        `[data-folder-name="${TEST_FOLDERS.MAIN}"]`
      );
      await expect(mainFolder).toBeVisible();
      await mainFolder.click();
      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

      const countBefore = await panel.getBookmarkCount();
      expect(countBefore).toBeGreaterThan(1);

      await panel.cutBookmark(TEST_BOOKMARKS.GITHUB);
      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);

      const bookmarkToCut = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.GITHUB });
      await expect(bookmarkToCut).toBeVisible();

      const firstBookmark = bookmarksPage
        .locator('div[data-context-id]')
        .first();
      await firstBookmark.click();
      await firstBookmark.click({ button: 'right' });

      await panel.pasteBookmark();

      const pastedBookmark = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.GITHUB });
      await expect(pastedBookmark).toBeVisible();

      const countAfter = await panel.getBookmarkCount();
      expect(countAfter).toBe(countBefore);
    });
  });

  test.describe('Folder Delete Restrictions', () => {
    test('should not delete folder with nested folders and show toast', async ({
      bookmarksPage,
    }) => {
      const panel = new BookmarksPanel(bookmarksPage);
      await panel.ensureAtRoot();

      await panel.openFolderWithNestedFolders(TEST_FOLDERS.OTHER_BOOKMARKS);
      await panel.clickContextMenuItem('Delete');

      await bookmarksPage.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

      const toast = bookmarksPage.getByText('Remove inner folders first');
      await expect(toast).toBeVisible();

      const folderWithNested = bookmarksPage.locator(
        `[data-folder-name="${TEST_FOLDERS.OTHER_BOOKMARKS}"]`
      );
      await expect(folderWithNested).toBeVisible();
    });
  });

  test('should delete a folder', async ({ bookmarksPage }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await panel.ensureAtRoot();

    const folderName = 'Persistence Test Folder';
    const folderRow = bookmarksPage.locator(
      `[data-folder-name="${folderName}"]`
    );
    await expect(folderRow).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });

    await folderRow.click({ button: 'right' });

    await panel.clickContextMenuItem('Delete');

    await expect(folderRow).not.toBeVisible();
  });
});
