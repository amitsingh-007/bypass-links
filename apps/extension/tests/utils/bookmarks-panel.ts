import { expect, type Page } from '@playwright/test';
import {
  countElements,
  fillDialogInput,
  openDialog,
  openFolder,
  rightClickAndSelectOption,
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
        selector: 'div[data-context-id]',
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
    const backButton = this.page
      .locator('[aria-label="back"]')
      .or(this.page.getByRole('button', { name: /back/i }))
      .filter({ visible: true })
      .first();
    await backButton.click({ force: true });
  }

  async ensureAtRoot() {
    const bookmarksButton = this.page.getByRole('button', {
      name: 'Bookmarks',
    });
    if (await bookmarksButton.isVisible()) {
      await bookmarksButton.click();
      await this.page.waitForTimeout(500);
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
    const folderRow = this.page.locator(`[data-folder-name="${folderName}"]`);
    await expect(folderRow).toBeVisible();
    await folderRow.click({ button: 'right' });
    await this.clickContextMenuItem('Delete');
    await expect(folderRow).not.toBeVisible();
  }

  async openEditBookmarkDialog(bookmarkTitle: string) {
    await rightClickAndSelectOption(
      this.page,
      'div[data-context-id]',
      bookmarkTitle,
      'Edit'
    );
    return this.page.getByRole('dialog');
  }

  async openBookmarkContextMenuItem(
    bookmarkTitle: string,
    menuItemText: string
  ) {
    await rightClickAndSelectOption(
      this.page,
      'div[data-context-id]',
      bookmarkTitle,
      menuItemText
    );
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
    const bookmarkRow = this.page
      .locator('div[data-context-id]')
      .filter({ hasText: bookmarkTitle });
    await bookmarkRow.click({ button: 'right' });
    await this.clickContextMenuItem('Delete');
    await this.page.waitForTimeout(500);
  }

  async selectBookmark(bookmarkTitle: string) {
    const bookmark = this.page
      .locator('div[data-context-id]')
      .filter({ hasText: bookmarkTitle });
    await expect(bookmark).toBeVisible();
    await bookmark.click();
  }

  async openBookmarkByDoubleClick(bookmarkTitle: string) {
    const bookmarkRow = this.page
      .locator('div[data-context-id]')
      .filter({ hasText: bookmarkTitle });
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
    const saveButton = this.page.getByRole('button', { name: /save/i }).last();
    await saveButton.click();
  }

  async clickContextMenuItem(itemText: string) {
    const menuItem = this.page.locator(
      '.mantine-contextmenu-item-button-title',
      {
        hasText: itemText,
      }
    );
    await menuItem.waitFor({ state: 'attached' });
    await menuItem.evaluate((el) => (el as HTMLElement).click());
  }

  async getBookmarkCount() {
    return countElements(this.page, 'div[data-context-id]');
  }

  async openFolderWithNestedFolders(folderName: string) {
    const folderWithNested = this.page.locator(
      `[data-folder-name="${folderName}"]`
    );
    await expect(folderWithNested).toBeVisible();
    await folderWithNested.click({ button: 'right' });
  }

  async hoverAvatar() {
    const avatarGroup = this.page.locator('[data-group-context-id]');
    const avatar = avatarGroup.locator('[data-person-uid]').first();
    await expect(avatar).toBeVisible({ timeout: 10_000 });
    await avatar.hover();

    const dropdown = this.page.locator('[data-person-dropdown]');
    await expect(dropdown).toBeVisible({ timeout: 10_000 });

    return { dropdown, avatar };
  }

  async clickPersonInDropdown(dropdown: ReturnType<Page['locator']>) {
    const dropdownAvatar = dropdown.locator('[data-person-name]');
    await dropdownAvatar.waitFor({ state: 'visible', timeout: 5000 });
    const personName =
      (await dropdownAvatar.getAttribute('data-person-name')) ?? '';
    await dropdownAvatar.click();
    return personName;
  }

  async getBadgeCount(name: string): Promise<number> {
    const badge = this.page
      .locator('.mantine-Badge-label')
      .filter({ hasText: name });
    await expect(badge).toBeVisible();

    const badgeText = (await badge.textContent()) ?? '';
    const countMatch = /\((\d+)\)/.exec(badgeText);

    if (!countMatch) {
      return 0;
    }

    return Number.parseInt(countMatch[1], 10);
  }

  async getEditButtons() {
    return this.page.getByTitle('Edit Bookmark');
  }
}
