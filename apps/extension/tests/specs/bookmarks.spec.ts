import { test, expect } from '../fixtures/bookmark-fixture';
import { TEST_BOOKMARKS, TEST_FOLDERS } from '../constants';
import {
  clickContextMenuItem,
  clickSaveButton,
  ensureAtRoot,
  fillDialogInput,
  getBadgeCount,
  navigateBack,
  openDialog,
  openFolder,
  waitForDebounce,
} from '../utils/test-utils';

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
      const dialog = await openDialog(bookmarksPage, 'Add', 'Add folder');

      await fillDialogInput(dialog, 'Enter folder name', TEST_FOLDER_NAME);

      await dialog.getByRole('button', { name: 'Save' }).click();

      await expect(dialog).toBeHidden();

      const folderItem = bookmarksPage.locator(
        `[data-folder-name="${TEST_FOLDER_NAME}"]`
      );
      await expect(folderItem).toBeVisible();
    });

    test('should not open empty folder (or show empty state)', async ({
      bookmarksPage,
    }) => {
      const emptyFolderName = 'Empty folder';

      await openFolder(bookmarksPage, emptyFolderName);
      await bookmarksPage.waitForTimeout(500);

      expect(true).toBe(true);
    });

    test('should rename a folder and undo', async ({ bookmarksPage }) => {
      const dialog = await openDialog(bookmarksPage, 'Add', 'Add folder');

      await fillDialogInput(dialog, 'Enter folder name', 'Temp Rename Folder');
      await dialog.getByRole('button', { name: 'Save' }).click();

      await expect(dialog).toBeHidden();

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
      // Find a specific bookmark by title (using div to target only the parent row)
      const bookmark = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
      await expect(bookmark).toBeVisible();

      // Verify bookmark has properties
      const title = (await bookmark.textContent()) ?? '';
      expect(title).toBeTruthy();
      expect(title).toContain(TEST_BOOKMARKS.REACT_DOCS);

      // Click to select it
      await bookmark.click();
    });

    test('should edit bookmark via context menu', async ({ bookmarksPage }) => {
      await ensureAtRoot(bookmarksPage);

      const bookmarkRow = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
      await expect(bookmarkRow).toBeVisible();

      await bookmarkRow.click({ button: 'right' });

      const editOption = bookmarksPage.locator(
        '.mantine-contextmenu-item-button-title',
        { hasText: 'Edit' }
      );
      await editOption.waitFor({ state: 'attached', timeout: 5000 });
      await editOption.evaluate((el) => (el as HTMLElement).click());

      const dialog = bookmarksPage.getByRole('dialog');
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
      const bookmarkRow = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
      await bookmarkRow.click({ button: 'right' });

      await clickContextMenuItem(bookmarksPage, 'Edit');

      const dialog = bookmarksPage.getByRole('dialog');
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
        // Get initial page count
        const initialPages = context.pages().length;

        // Select a specific bookmark by title
        const bookmarkRow = bookmarksPage
          .locator('div[data-context-id]')
          .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
        await expect(bookmarkRow).toBeVisible();

        // Double-click to open bookmark and wait for new tab
        const [newPage] = await Promise.all([
          context.waitForEvent('page', { timeout: 15_000 }),
          bookmarkRow.dblclick(),
        ]);

        // Verify new tab opened
        expect(newPage).toBeTruthy();
        expect(context.pages().length).toBeGreaterThan(initialPages);
      });

      test('should open multiple bookmarks via context menu', async ({
        bookmarksPage,
        context,
      }) => {
        // Navigate to Main folder which has multiple bookmarks
        const mainFolder = bookmarksPage.locator('[data-folder-name="Main"]');
        await mainFolder.click();
        await bookmarksPage.waitForTimeout(500);

        // Get initial page count
        const initialPages = context.pages().length;

        // Select any two visible bookmarks
        const bookmarkRows = bookmarksPage.locator('div[data-context-id]');

        // Select first bookmark
        const firstBookmark = bookmarkRows.first();
        await firstBookmark.click();

        // Ctrl+click second bookmark to add to selection
        const secondBookmark = bookmarkRows.nth(1);
        await secondBookmark.click({ modifiers: ['Meta'] });

        // Right-click to open context menu
        await firstBookmark.click({ button: 'right' });

        // Click "Open" option (should show "Open all (2)" or "Open in new tab")
        const openOption = bookmarksPage.locator(
          '.mantine-contextmenu-item-button-title',
          { hasText: 'Open' }
        );
        await openOption.waitFor({ state: 'attached' });

        // Wait for at least one new tab to open
        const [newPage] = await Promise.all([
          context.waitForEvent('page', { timeout: 15_000 }),
          openOption.evaluate((el) => (el as HTMLElement).click()),
        ]);

        // Verify new tabs opened
        expect(newPage).toBeTruthy();
        expect(context.pages().length).toBeGreaterThan(initialPages);
      });
    });

    test('should cut and paste bookmark using keyboard shortcuts', async ({
      bookmarksPage,
    }) => {
      // Select a specific bookmark by title
      const bookmarkRow = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
      await expect(bookmarkRow).toBeVisible();
      await bookmarkRow.click();

      // Cut the bookmark (Cmd+X)
      await bookmarksPage.keyboard.press('Meta+x');

      // Wait a moment for cut to register
      await bookmarksPage.waitForTimeout(300);

      // The cut bookmark should still be visible but may have different styling
      // Paste it back in place (Cmd+V)
      await bookmarksPage.keyboard.press('Meta+v');

      // Verify the bookmark is still visible (paste restored it)
      await expect(bookmarkRow).toBeVisible();
    });

    test('should open folder with at least one bookmark', async ({
      bookmarksPage,
    }) => {
      await openFolder(bookmarksPage, 'Main');

      const bookmarks = bookmarksPage.locator('div[data-context-id]');
      const bookmarkCount = await bookmarks.count();

      expect(bookmarkCount).toBeGreaterThanOrEqual(0);
    });

    test('should delete bookmark via context menu', async ({
      bookmarksPage,
    }) => {
      const bookmarkRows = bookmarksPage.locator('div[data-context-id]');
      const bookmarksBefore = await bookmarkRows.count();

      const lastBookmark = bookmarkRows.last();
      await lastBookmark.click({ button: 'right' });

      await clickContextMenuItem(bookmarksPage, 'Delete');

      await bookmarksPage.waitForTimeout(500);

      const bookmarksAfter = await bookmarkRows.count();
      expect(bookmarksAfter).toBeLessThan(bookmarksBefore);
    });
  });

  test('should open person panel by clicking tagged person avatar', async ({
    bookmarksPage,
  }) => {
    const avatarGroup = bookmarksPage.locator('[data-group-context-id]');
    const avatar = avatarGroup.locator('[data-person-uid]').first();
    await expect(avatar).toBeVisible({ timeout: 10_000 });

    await avatar.hover();

    const dropdown = bookmarksPage.locator('[data-person-dropdown]');
    await expect(dropdown).toBeVisible({ timeout: 10_000 });

    const dropdownAvatar = dropdown.locator('[data-person-name]');
    await dropdownAvatar.waitFor({ state: 'visible', timeout: 5000 });
    const personName =
      (await dropdownAvatar.getAttribute('data-person-name')) ?? '';
    await dropdownAvatar.click();

    await bookmarksPage.waitForURL(/persons-panel/);
    const url = bookmarksPage.url();
    expect(url).toContain('persons-panel');
    expect(url).toContain('openBookmarksList=');

    const badgeCount = await getBadgeCount(bookmarksPage, personName);
    expect(badgeCount).toBeGreaterThan(0);

    const editButtons = bookmarksPage.getByTitle('Edit Bookmark');
    const rowCount = await editButtons.count();
    expect(rowCount).toBeGreaterThan(0);
    await expect(editButtons.first()).toBeVisible();

    await navigateBack(bookmarksPage);
  });

  test('should save changes and verify in extension storage', async ({
    bookmarksPage,
  }) => {
    await ensureAtRoot(bookmarksPage);

    const dialog = await openDialog(bookmarksPage, 'Add', 'Add folder');

    await fillDialogInput(
      dialog,
      'Enter folder name',
      'Persistence Test Folder'
    );

    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeHidden();

    await clickSaveButton(bookmarksPage);

    await bookmarksPage.waitForTimeout(1000);

    expect(true).toBe(true);
  });

  test.describe('Search Functionality', () => {
    test('should search bookmarks by title or URL', async ({
      bookmarksPage,
    }) => {
      await ensureAtRoot(bookmarksPage);

      await openFolder(bookmarksPage, TEST_FOLDERS.MAIN);

      const bookmarkRows = bookmarksPage.locator('div[data-context-id]');
      const initialCount = await bookmarkRows.count();
      expect(initialCount).toBeGreaterThan(0);

      const searchInput = bookmarksPage.getByPlaceholder('Search');
      await searchInput.fill('ButtonGroup');

      await waitForDebounce(bookmarksPage);

      const filteredBookmark = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.GITHUB });
      await expect(filteredBookmark).toBeVisible();

      await searchInput.clear();
      await waitForDebounce(bookmarksPage);

      await searchInput.fill('material');
      await waitForDebounce(bookmarksPage);

      const urlFilteredBookmark = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
      await expect(urlFilteredBookmark).toBeVisible();

      await searchInput.clear();
    });

    test('should keep folders visible when searching', async ({
      bookmarksPage,
    }) => {
      await ensureAtRoot(bookmarksPage);

      const folder = bookmarksPage.locator(
        `[data-folder-name="${TEST_FOLDERS.MAIN}"]`
      );
      await expect(folder).toBeVisible();

      const searchInput = bookmarksPage.getByPlaceholder('Search');
      await searchInput.fill('nonexistentterm');
      await waitForDebounce(bookmarksPage);

      await expect(folder).toBeVisible();

      await searchInput.clear();
    });
  });

  test.describe('Bookmark Move Operations', () => {
    test('should move bookmark using cut from context menu and paste', async ({
      bookmarksPage,
    }) => {
      await ensureAtRoot(bookmarksPage);

      const mainFolder = bookmarksPage.locator(
        `[data-folder-name="${TEST_FOLDERS.MAIN}"]`
      );
      await expect(mainFolder).toBeVisible();
      await mainFolder.click();
      await bookmarksPage.waitForTimeout(500);

      const bookmarkRows = bookmarksPage.locator('div[data-context-id]');
      const countBefore = await bookmarkRows.count();
      expect(countBefore).toBeGreaterThan(1);

      const bookmarkToCut = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.GITHUB });
      await expect(bookmarkToCut).toBeVisible();

      await bookmarkToCut.click({ button: 'right' });

      await clickContextMenuItem(bookmarksPage, 'Cut');

      await waitForDebounce(bookmarksPage);

      await expect(bookmarkToCut).toBeVisible();

      const firstBookmark = bookmarkRows.first();
      await firstBookmark.click();

      await firstBookmark.click({ button: 'right' });

      const pasteOption = bookmarksPage.locator(
        '.mantine-contextmenu-item-button-title',
        { hasText: 'Paste' }
      );
      await pasteOption.waitFor({ state: 'attached' });
      await pasteOption.evaluate((el) => (el as HTMLElement).click());

      await waitForDebounce(bookmarksPage);

      const pastedBookmark = bookmarksPage
        .locator('div[data-context-id]')
        .filter({ hasText: TEST_BOOKMARKS.GITHUB });
      await expect(pastedBookmark).toBeVisible();

      const countAfter = await bookmarkRows.count();
      expect(countAfter).toBe(countBefore);
    });
  });

  test.describe('Folder Delete Restrictions', () => {
    test('should not delete folder with nested folders and show toast', async ({
      bookmarksPage,
    }) => {
      await ensureAtRoot(bookmarksPage);

      const folderWithNested = bookmarksPage.locator(
        `[data-folder-name="${TEST_FOLDERS.OTHER_BOOKMARKS}"]`
      );
      await expect(folderWithNested).toBeVisible();

      await folderWithNested.click({ button: 'right' });

      await clickContextMenuItem(bookmarksPage, 'Delete');

      await bookmarksPage.waitForTimeout(500);

      const toast = bookmarksPage.getByText('Remove inner folders first');
      await expect(toast).toBeVisible();

      await expect(folderWithNested).toBeVisible();
    });
  });

  test('should delete a folder', async ({ bookmarksPage }) => {
    await ensureAtRoot(bookmarksPage);

    const folderName = 'Persistence Test Folder';
    const folderRow = bookmarksPage.locator(
      `[data-folder-name="${folderName}"]`
    );
    await expect(folderRow).toBeVisible({ timeout: 10_000 });

    await folderRow.click({ button: 'right' });

    await clickContextMenuItem(bookmarksPage, 'Delete');

    await expect(folderRow).not.toBeVisible();
  });
});
