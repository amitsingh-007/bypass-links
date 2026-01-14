import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '../constants';
import {
  clickContextMenuItem as clickContextMenuItemUtil,
  countElements,
  fillDialogInput,
  getBadgeCount as getBadgeCountUtil,
  navigateBack as navigateBackUtil,
  openDialog,
  openFolder,
  searchAndVerify,
  waitForDebounce,
} from './test-utils';

export class BookmarksPanel {
  constructor(readonly page: Page) {}

  async search(
    query: string,
    options?: { visibleTexts?: string[]; hiddenTexts?: string[] }
  ) {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.fill(query);
    await waitForDebounce(this.page);

    if (options?.visibleTexts ?? options?.hiddenTexts) {
      await searchAndVerify(this.page, query, {
        visibleTexts: options.visibleTexts ?? [],
        hiddenTexts: options.hiddenTexts ?? [],
        selector: '[data-testid="bookmark-item"]',
      });
    }
  }

  async clearSearch() {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.clear();
    await waitForDebounce(this.page);
  }

  async openFolder(folderName: string) {
    await openFolder(this.page, folderName);
  }

  async navigateBack() {
    await navigateBackUtil(this.page);
  }

  async ensureAtRoot() {
    const bookmarksButton = this.page.getByRole('button', {
      name: 'Bookmarks',
    });
    if (await bookmarksButton.isVisible()) {
      await bookmarksButton.click();
      await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
    }
  }

  async openAddFolderDialog() {
    return openDialog(this.page, 'Add', 'Add folder');
  }

  async createFolder(folderName: string) {
    const dialog = await this.openAddFolderDialog();
    await fillDialogInput(dialog, 'Enter folder name', folderName);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
  }

  async deleteFolder(folderName: string) {
    const folderRow = this.page.getByTestId(`folder-item-${folderName}`);
    await expect(folderRow).toBeVisible();
    await folderRow.click({ button: 'right' });
    await this.clickContextMenuItem('Delete');
    await expect(folderRow).not.toBeVisible();
  }

  async openEditBookmarkDialog(bookmarkTitle: string) {
    const element = this.page.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await expect(element).toBeVisible();
    await element.click({ button: 'right' });
    await this.clickContextMenuItem('Edit');
    return this.page.getByRole('dialog');
  }

  async openBookmarkContextMenuItem(
    bookmarkTitle: string,
    menuItemText: string
  ) {
    const element = this.page.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await expect(element).toBeVisible();
    await element.click({ button: 'right' });
    await this.clickContextMenuItem(menuItemText);
  }

  async cutBookmark(bookmarkTitle: string) {
    await this.openBookmarkContextMenuItem(bookmarkTitle, 'Cut');
  }

  async pasteBookmark() {
    const pasteOption = this.page.locator(
      '.mantine-contextmenu-item-button-title',
      { hasText: 'Paste' }
    );
    await pasteOption.waitFor({ state: 'attached' });
    await pasteOption.evaluate((el) => (el as HTMLElement).click());
    await waitForDebounce(this.page);
  }

  async deleteBookmark(bookmarkTitle: string) {
    const bookmarkRow = this.page.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await bookmarkRow.click({ button: 'right' });
    await this.clickContextMenuItem('Delete');
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async selectBookmark(bookmarkTitle: string) {
    const bookmark = this.page.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await expect(bookmark).toBeVisible();
    await bookmark.click();
  }

  async openBookmarkByDoubleClick(bookmarkTitle: string) {
    const bookmarkRow = this.page.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await expect(bookmarkRow).toBeVisible();
    await bookmarkRow.dblclick();
  }

  async openBookmarksViaContextMenu() {
    const openOption = this.page.locator(
      '.mantine-contextmenu-item-button-title',
      { hasText: 'Open' }
    );
    await openOption.waitFor({ state: 'attached' });
    await openOption.evaluate((el) => (el as HTMLElement).click());
  }

  async clickSaveButton() {
    const saveButton = this.getSaveButton();
    await saveButton.click();
  }

  async clickContextMenuItem(itemText: string) {
    await clickContextMenuItemUtil(this.page, itemText);
  }

  async getBookmarkCount() {
    return countElements(this.page, '[data-testid^="bookmark-item-"]');
  }

  async openFolderWithNestedFolders(folderName: string) {
    const folderWithNested = this.page.getByTestId(`folder-item-${folderName}`);
    await expect(folderWithNested).toBeVisible();
    await folderWithNested.click({ button: 'right' });
  }

  async hoverAvatar() {
    const avatarGroup = this.page.locator('[data-group-context-id]');
    const avatar = avatarGroup.locator('[data-person-uid]').first();
    await expect(avatar).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });
    await avatar.hover();

    const dropdown = this.page.locator('[data-person-dropdown]');
    await expect(dropdown).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });

    return { dropdown, avatar };
  }

  async clickPersonInDropdown(dropdown: ReturnType<Page['locator']>) {
    const dropdownAvatar = dropdown.locator('[data-person-name]');
    await dropdownAvatar.waitFor({
      state: 'visible',
      timeout: TEST_TIMEOUTS.IMAGE_LOAD,
    });
    // Wait for element to be stable before clicking
    await this.page.waitForTimeout(300);
    const personName =
      (await dropdownAvatar.getAttribute('data-person-name')) ?? '';
    await dropdownAvatar.click({ force: true });
    return personName;
  }

  async getBadgeCount(name: string): Promise<number> {
    return getBadgeCountUtil(this.page, name);
  }

  async getEditButtons() {
    return this.page.getByTitle('Edit Bookmark');
  }

  // ============ Verification Helpers ============

  async verifyBookmarkExists(bookmarkTitle: string) {
    const bookmark = this.page.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await expect(bookmark).toBeVisible();
  }

  async verifyFolderExists(folderName: string) {
    const folder = this.page.getByTestId(`folder-item-${folderName}`);
    await expect(folder).toBeVisible();
  }

  async verifyBookmarkNotExists(bookmarkTitle: string) {
    const bookmark = this.page.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await expect(bookmark).not.toBeVisible();
  }

  async verifyFolderNotExists(folderName: string) {
    const folder = this.page.getByTestId(`folder-item-${folderName}`);
    await expect(folder).not.toBeVisible();
  }

  // ============ Selector Encapsulation ============

  getBookmarkElement(bookmarkTitle: string) {
    return this.page.getByTestId(`bookmark-item-${bookmarkTitle}`);
  }

  getFolderElement(folderName: string) {
    return this.page.getByTestId(`folder-item-${folderName}`);
  }

  getSearchInput() {
    return this.page.getByPlaceholder('Search');
  }

  getSaveButton() {
    return this.page.getByRole('button', { name: /save/i }).last();
  }

  getBookmarkItems() {
    return this.page.locator('[data-testid^="bookmark-item-"]');
  }

  getFolderItems() {
    return this.page.locator('[data-testid^="folder-item-"]');
  }

  getDialogCloseButton() {
    return this.page.getByTestId('modal-close-button');
  }

  // ============ Composite Operations ============

  async closeDialog() {
    const closeButton = this.getDialogCloseButton();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }
}
