import { expect, type Page } from '@playwright/test';

import {
  clickDropdownPersonAndGetName,
  clickContextMenuItem as clickContextMenuItemUtil,
  closeDialog,
  dblclickBookmark,
  fillDialogInput,
  getBadgeCount as getBadgeCountUtil,
  gotoPanel,
  navigateBack as navigateBackUtil,
  openDialog,
  openFolder,
} from './test-utils';

export class BookmarksPanel {
  constructor(readonly page: Page) {}

  async openFolder(folderName: string) {
    await openFolder(this.page, folderName);
  }

  async navigateBack() {
    await navigateBackUtil(this.page);
  }

  /** Add is the only control disabled while bookmarks are still loading. */
  async ensureAtRoot() {
    await gotoPanel(this.page, 'Bookmarks');
    await expect(
      this.page.getByRole('button', { name: 'Add', exact: true })
    ).toBeEnabled();
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
    await this.clickContextMenuItem('edit');
    return this.page.getByRole('dialog');
  }

  async openBookmarkContextMenu(bookmarkTitle: string) {
    const element = this.getBookmarkElement(bookmarkTitle);
    await expect(element).toBeVisible();
    await element.click({ button: 'right' });
  }

  async openBookmarkContextMenuItem(bookmarkTitle: string, menuItemId: string) {
    await this.openBookmarkContextMenu(bookmarkTitle);
    await this.clickContextMenuItem(menuItemId);
  }

  async cutBookmark(bookmarkTitle: string) {
    await this.openBookmarkContextMenuItem(bookmarkTitle, 'cut');
  }

  async pasteBookmark() {
    await this.clickContextMenuItem('paste');
  }

  /**
   * The assertion is load-bearing: selection lives in the store and a bookmark
   * reload wipes it, so callers acting on the selection need it to have landed.
   */
  async selectBookmark(bookmarkTitle: string, { extend = false } = {}) {
    const bookmark = this.getBookmarkElement(bookmarkTitle);
    await expect(bookmark).toBeVisible();
    await bookmark.click({ modifiers: extend ? ['ControlOrMeta'] : [] });
    await expect(this.getBookmarkRow(bookmarkTitle)).toHaveAttribute(
      'data-is-selected',
      'true'
    );
  }

  /**
   * Cut and paste read the store's selection rather than the right-clicked row,
   * so both bookmarks have to be left-clicked on the way through.
   */
  async moveBookmarkOnto(cutTitle: string, targetTitle: string) {
    await this.selectBookmark(cutTitle);
    await this.openBookmarkContextMenuItem(cutTitle, 'cut');
    await this.selectBookmark(targetTitle);
    await this.openBookmarkContextMenu(targetTitle);
    await this.pasteBookmark();
  }

  async getBookmarkTitles() {
    return this.getBookmarkItems().evaluateAll((rows) =>
      rows.map((row) =>
        (row.getAttribute('data-testid') ?? '').replace('bookmark-item-', '')
      )
    );
  }

  async openBookmarkByDoubleClick(bookmarkTitle: string) {
    await dblclickBookmark(this.page, bookmarkTitle);
  }

  async clickSaveButton() {
    const saveButton = this.getSaveButton();
    await saveButton.click();
    await expect(this.page.getByText('Saved temporarily')).toBeVisible();
  }

  async clickContextMenuItem(itemId: string) {
    await clickContextMenuItemUtil(this.page, itemId);
  }

  async getBookmarkCount() {
    return this.page.locator('[data-testid^="bookmark-item-"]').count();
  }

  async openFolderWithNestedFolders(folderName: string) {
    const folderWithNested = this.page.getByTestId(`folder-item-${folderName}`);
    await expect(folderWithNested).toBeVisible();
    await folderWithNested.click({ button: 'right' });
  }

  async hoverAvatar() {
    const avatarGroup = this.page.getByTestId('avatar-group');
    const avatar = avatarGroup.locator('[data-testid^="avatar-"]').first();
    await expect(avatar).toBeVisible();
    await avatar.hover();

    const dropdown = this.page.locator('[data-testid^="person-dropdown-"]');
    await expect(dropdown).toBeVisible();

    return { dropdown, avatar };
  }

  async clickPersonInDropdown(dropdown: ReturnType<Page['locator']>) {
    return clickDropdownPersonAndGetName(dropdown);
  }

  async getBadgeCount(name: string): Promise<number> {
    return getBadgeCountUtil(this.page, name);
  }

  async getEditButtons() {
    return this.page.getByTitle('Edit Bookmark');
  }

  async openPersonSelect(bookmarkTitle: string) {
    const dialog = await this.openEditBookmarkDialog(bookmarkTitle);
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('person-select').click();
    return dialog;
  }

  async addPersonToBookmark(bookmarkTitle: string, personName: string) {
    const dialog = await this.openPersonSelect(bookmarkTitle);

    const option = this.page.getByRole('option', { name: personName });
    await option.click();
    await expect(dialog.getByText(personName)).toBeVisible();

    // Close the dropdown by pressing Escape before clicking save
    await this.page.keyboard.press('Escape');

    const saveButton = dialog.getByTestId('dialog-save-button');
    await saveButton.click();
    await expect(dialog).toBeHidden();

    await this.clickSaveButton();
    await expect(this.getSaveButton()).toBeDisabled();
  }

  async removePersonFromBookmark(bookmarkTitle: string, personName: string) {
    const dialog = await this.openPersonSelect(bookmarkTitle);

    const option = this.page.getByRole('option', { name: personName });
    await expect(option).toBeVisible();
    await option.click();

    // Close dropdown before saving
    await this.page.keyboard.press('Escape');

    const saveButton = dialog.getByTestId('dialog-save-button');
    await saveButton.click();
    await expect(dialog).toBeHidden();

    await this.clickSaveButton();
    await expect(this.getSaveButton()).toBeDisabled();
  }

  async navigateToPersonsPanel() {
    await gotoPanel(this.page, 'Persons');
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

  /** The virtual row wrapping the bookmark, which carries `data-is-selected`. */
  getBookmarkRow(bookmarkTitle: string) {
    return this.getBookmarkElement(bookmarkTitle).locator('xpath=..');
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

  getContextMenu() {
    return this.page.getByRole('menu');
  }

  getContextMenuItem(itemId: string) {
    return this.page.getByTestId(`context-menu-item-${itemId}`);
  }

  // ============ Composite Operations ============

  async closeDialog() {
    await closeDialog(this.page);
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
