import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
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
    await this.page.goto('/index.html');
    const bookmarksButton = this.page.getByRole('button', {
      name: 'Bookmarks',
    });
    await expect(bookmarksButton).toBeVisible();
    await bookmarksButton.click();
    await expect(this.getSearchInput()).toBeVisible();
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
    const pasteOption = this.page.locator('.context-menu-item-paste');
    await pasteOption.waitFor({ state: 'attached' });
    await pasteOption.evaluate((el) => (el as HTMLElement).click());
    await waitForDebounce(this.page);
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

  async clickSaveButton() {
    const saveButton = this.getSaveButton();
    await saveButton.click();
    await expect(this.page.getByText('Saved temporarily')).toBeVisible();
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
    const avatarGroup = this.page.getByTestId('avatar-group');
    const avatar = avatarGroup.locator('[data-testid^="avatar-"]').first();
    await expect(avatar).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });
    await avatar.hover();

    const dropdown = this.page.locator('[data-testid^="person-dropdown-"]');
    await expect(dropdown).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });

    return { dropdown, avatar };
  }

  async clickPersonInDropdown(dropdown: ReturnType<Page['locator']>) {
    const dropdownAvatar = dropdown.locator(
      '[data-testid^="dropdown-avatar-"]'
    );
    await dropdownAvatar.waitFor({
      state: 'visible',
      timeout: TEST_TIMEOUTS.IMAGE_LOAD,
    });
    // Wait for element to be stable before clicking
    await this.page.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);
    const testId = (await dropdownAvatar.getAttribute('data-testid')) ?? '';
    const personName = testId.replace('dropdown-avatar-', '');
    await dropdownAvatar.click();
    return personName;
  }

  async getBadgeCount(name: string): Promise<number> {
    return getBadgeCountUtil(this.page, name);
  }

  async getEditButtons() {
    return this.page.getByTitle('Edit Bookmark');
  }

  async addPersonToBookmark(bookmarkTitle: string, personName: string) {
    const dialog = await this.openEditBookmarkDialog(bookmarkTitle);
    await expect(dialog).toBeVisible();

    const personSelect = dialog.getByTestId('person-select');
    await personSelect.click();

    const option = this.page.getByRole('option', { name: personName });
    await option.click();
    await expect(dialog.getByText(personName)).toBeVisible();

    const saveButton = dialog.getByRole('button', { name: 'Save' });
    await saveButton.click();
    await expect(dialog).toBeHidden();

    await this.clickSaveButton();
    await expect(this.getSaveButton()).toBeDisabled();
  }

  async removePersonFromBookmark(bookmarkTitle: string, personName: string) {
    const dialog = await this.openEditBookmarkDialog(bookmarkTitle);
    await expect(dialog).toBeVisible();

    const pillToRemove = dialog.locator('.mantine-MultiSelect-pill', {
      hasText: personName,
    });
    await expect(pillToRemove).toBeVisible();

    const removeButton = pillToRemove.locator('button');
    await removeButton.click();
    await expect(pillToRemove).not.toBeVisible();

    const saveButton = dialog.getByRole('button', { name: 'Save' });
    await saveButton.click();
    await expect(dialog).toBeHidden();

    await this.clickSaveButton();
    await expect(this.getSaveButton()).toBeDisabled();
  }

  async navigateToPersonsPanel() {
    await this.page.goto('/index.html');
    const personsButton = this.page.getByRole('button', { name: 'Persons' });
    await expect(personsButton).toBeVisible();
    await personsButton.click();
    await expect(this.page.getByPlaceholder('Search')).toBeVisible();
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

  // ============ URL Editing Helpers ============

  getUrlInput() {
    return this.page.getByTestId('bookmark-url-input');
  }

  async editBookmarkUrl(bookmarkTitle: string, newUrl: string) {
    const dialog = await this.openEditBookmarkDialog(bookmarkTitle);
    await expect(dialog).toBeVisible();

    const urlInput = this.getUrlInput();
    await urlInput.clear();
    await urlInput.fill(newUrl);

    const saveButton = dialog.getByTestId('dialog-save-button');
    await saveButton.click();

    return dialog;
  }

  async verifyErrorNotification(message: string) {
    const notification = this.page.getByText(message);
    await expect(notification).toBeVisible();
  }
}
