import {
  BookmarksPanelBase,
  closeDialog,
  parseBadgeCount,
} from '@bypass/shared/tests';
import { expect } from '@playwright/test';

import {
  clickContextMenuItem,
  fillDialogInput,
  gotoPanel,
  navigateBack,
  openAddDialog,
} from './test-utils';

export class BookmarksPanel extends BookmarksPanelBase {
  async navigateBack() {
    await navigateBack(this.page);
  }

  /** Add is the only control disabled while bookmarks are still loading. */
  async ensureAtRoot() {
    await gotoPanel(this.page, 'Bookmarks');
    await expect(
      this.page.getByRole('button', { name: 'Add', exact: true })
    ).toBeEnabled();
  }

  async openAddFolderDialog() {
    return openAddDialog(this.page, 'Add folder');
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

  async deselectBookmark(bookmarkTitle: string) {
    await this.getBookmarkElement(bookmarkTitle).click({
      modifiers: ['ControlOrMeta'],
    });
    await expect(this.getBookmarkRow(bookmarkTitle)).toHaveAttribute(
      'data-is-selected',
      'false'
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

  /** The toast is matched loosely: saves in quick succession stack several up. */
  async clickSaveButton() {
    const saveButton = this.getSaveButton();
    await saveButton.click();
    await expect(
      this.page.getByText('Saved temporarily').first()
    ).toBeVisible();
    await expect(saveButton).toBeDisabled();
  }

  async clickContextMenuItem(itemId: string) {
    await clickContextMenuItem(this.page, itemId);
  }

  async openFolderContextMenu(folderName: string) {
    const folder = this.getFolderElement(folderName);
    await expect(folder).toBeVisible();
    await folder.click({ button: 'right' });
  }

  /** Right-click, Edit, retype, Save. Leaves the rename unsaved to storage. */
  async renameFolder(folderName: string, newName: string) {
    await this.openFolderContextMenu(folderName);
    await this.clickContextMenuItem('edit');

    const dialog = this.page.getByRole('dialog', { name: 'Edit folder' });
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('folder-name-input').fill(newName);
    await dialog.getByTestId('dialog-save-button').click();
    await expect(dialog).toBeHidden();
  }

  async setFolderDefault(folderName: string, isDefault: boolean) {
    await this.openFolderContextMenu(folderName);
    await this.clickContextMenuItem(
      isDefault ? 'make-default' : 'remove-default'
    );
  }

  /** Repoints the bookmark's folder in the edit dialog, leaving it unsaved. */
  async moveBookmarkToFolder(bookmarkTitle: string, folderName: string) {
    const dialog = await this.openEditBookmarkDialog(bookmarkTitle);
    await dialog.getByTestId('bookmark-folder-select').click();
    await this.page.getByRole('option', { name: folderName }).click();
    await dialog.getByTestId('dialog-save-button').click();
    await expect(dialog).toBeHidden();
  }

  /** Reads the bookmarks-list badge, checking it belongs to `name` first. */
  async getBadgeCount(name: string): Promise<number> {
    const badge = this.page.getByTestId('person-bookmark-count-badge');
    await expect(badge).toContainText(name);
    return parseBadgeCount((await badge.textContent()) ?? '');
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

    await this.page.keyboard.press('Escape');

    const saveButton = dialog.getByTestId('dialog-save-button');
    await saveButton.click();
    await expect(dialog).toBeHidden();

    await this.clickSaveButton();
  }

  async removePersonFromBookmark(bookmarkTitle: string, personName: string) {
    const dialog = await this.openPersonSelect(bookmarkTitle);

    const option = this.page.getByRole('option', { name: personName });
    await expect(option).toBeVisible();
    await option.click();

    await this.page.keyboard.press('Escape');

    const saveButton = dialog.getByTestId('dialog-save-button');
    await saveButton.click();
    await expect(dialog).toBeHidden();

    await this.clickSaveButton();
  }

  async navigateToPersonsPanel() {
    await gotoPanel(this.page, 'Persons');
  }

  async verifyFolderNotExists(folderName: string) {
    await expect(this.getFolderElement(folderName)).not.toBeVisible();
  }

  /** The virtual row wrapping the bookmark, which carries `data-is-selected`. */
  getBookmarkRow(bookmarkTitle: string) {
    return this.getBookmarkElement(bookmarkTitle).locator('xpath=..');
  }

  getSaveButton() {
    return this.page.getByRole('button', { name: /save/i }).last();
  }

  getContextMenu() {
    return this.page.getByRole('menu');
  }

  async closeDialog() {
    await closeDialog(this.page);
  }

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
