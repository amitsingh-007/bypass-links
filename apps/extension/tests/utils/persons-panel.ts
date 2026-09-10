import {
  closeDialog,
  parseBadgeCount,
  PersonsPanelBase,
} from '@bypass/shared/tests';
import { expect, type Page } from '@playwright/test';

import {
  clickDialogButton,
  clickContextMenuItem,
  fillDialogInput,
  gotoPanel,
  navigateBack,
  openAddDialog,
} from './test-utils';

const DIALOG_CLOSE_TIMEOUT = 15_000;

const openImagePicker = async (
  page: Page,
  dialog: ReturnType<Page['getByRole']>
) => {
  const changeAvatarButton = dialog.getByTestId('change-avatar-button');
  await changeAvatarButton.click();

  const imagePickerDialog = page.getByRole('dialog', { name: 'Upload Image' });
  await expect(imagePickerDialog).toBeVisible();

  return imagePickerDialog;
};

const uploadImage = async (
  imagePickerDialog: ReturnType<Page['getByRole']>,
  imageUrl: string
) => {
  const imageUrlInput = imagePickerDialog.getByPlaceholder('Enter image url');
  await imageUrlInput.fill(imageUrl);

  const saveCroppedButton = imagePickerDialog.getByTestId('save-cropped-image');
  await expect(saveCroppedButton).toBeEnabled();
  await saveCroppedButton.click();

  // The picker closes only once the upload has landed, which a real one is slow
  // enough to outlast the default timeout
  await expect(imagePickerDialog).toBeHidden({ timeout: DIALOG_CLOSE_TIMEOUT });
};

const changeImageInDialog = async (
  page: Page,
  dialog: ReturnType<Page['getByRole']>,
  imageUrl: string
) => {
  const imagePickerDialog = await openImagePicker(page, dialog);
  await uploadImage(imagePickerDialog, imageUrl);
};

export class PersonsPanel extends PersonsPanelBase {
  /** Leaves both dialogs open, for the paths that never reach a saved image. */
  async openImagePicker(personName: string) {
    const dialog = await this.openEditPersonDialog(personName);
    return {
      dialog,
      imagePicker: await openImagePicker(this.page, dialog),
    };
  }

  getPickerUrlInput() {
    return this.page.getByPlaceholder('Enter image url');
  }

  getPickerSaveButton() {
    return this.page.getByTestId('save-cropped-image');
  }

  async openAddPersonDialog() {
    return openAddDialog(this.page, 'Add Person');
  }

  async addPerson(name: string, imageUrl?: string) {
    const dialog = await this.openAddPersonDialog();
    await fillDialogInput(dialog, 'Enter name', name);

    if (imageUrl) {
      await changeImageInDialog(this.page, dialog, imageUrl);
    }

    await clickDialogButton(dialog, 'Save');
    await expect(dialog).toBeHidden({ timeout: DIALOG_CLOSE_TIMEOUT });

    const newPersonCard = this.page.getByTestId(`person-item-${name}`);
    await expect(newPersonCard).toBeVisible();
  }

  async openEditPersonDialog(personName: string) {
    const personCard = this.page.getByTestId(`person-item-${personName}`);
    await expect(personCard).toBeVisible();
    await personCard.click({ button: 'right' });
    await clickContextMenuItem(this.page, 'edit');
    return this.page.getByRole('dialog', { name: 'Edit Person' });
  }

  async editPersonName(originalName: string, newName: string) {
    const dialog = await this.openEditPersonDialog(originalName);
    const nameInput = dialog.getByPlaceholder('Enter name');
    await nameInput.fill(newName);

    await clickDialogButton(dialog, 'Save');
    await expect(dialog).toBeHidden({ timeout: DIALOG_CLOSE_TIMEOUT });

    const editedPersonCard = this.page.getByTestId(`person-item-${newName}`);
    await expect(editedPersonCard).toBeVisible();
  }

  async changePersonImage(personName: string, newImageUrl: string) {
    const dialog = await this.openEditPersonDialog(personName);
    await expect(dialog).toBeVisible();

    await changeImageInDialog(this.page, dialog, newImageUrl);

    await clickDialogButton(dialog, 'Save');
    await expect(dialog).toBeHidden({ timeout: DIALOG_CLOSE_TIMEOUT });

    const personCardAfter = this.page.getByTestId(`person-item-${personName}`);
    await expect(personCardAfter).toBeVisible();
  }

  async deletePerson(personName: string) {
    const personCard = this.page.getByTestId(`person-item-${personName}`);
    await expect(personCard).toBeVisible();

    await personCard.click({ button: 'right' });
    await clickContextMenuItem(this.page, 'delete');

    const notification = this.page.getByText('Person deleted successfully');
    // Deleting waits on the account's stored image, which is as slow as an upload
    await expect(notification).toBeVisible({ timeout: DIALOG_CLOSE_TIMEOUT });

    await expect(personCard).not.toBeVisible();
  }

  async verifyAvatarVisibleInEditDialog(personName: string) {
    const dialog = await this.openEditPersonDialog(personName);
    await expect(dialog).toBeVisible();

    const avatar = dialog.locator('img');
    await expect(avatar).toBeVisible();

    await closeDialog(this.page, dialog);
  }

  async openPersonCard(personName: string) {
    const personCard = this.getPersonCardElement(personName);
    await expect(personCard).toBeVisible();
    await personCard.click();
  }

  async ensureAtRoot() {
    await gotoPanel(this.page, 'Persons');
    await expect(
      this.page.locator('[data-testid^="person-item-"]').first()
    ).toBeVisible();
  }

  async navigateBack() {
    await navigateBack(this.page);
  }

  async verifyBadgeCount(personName: string, expectedCount?: number) {
    await this.openPersonCard(personName);

    const badge = this.getBookmarkCountBadge();
    await expect(badge).toContainText(personName);
    const badgeCount = parseBadgeCount((await badge.textContent()) ?? '');

    if (expectedCount === undefined) {
      expect(badgeCount).toBeGreaterThanOrEqual(0);

      const editButtons = this.page.getByTitle('Edit Bookmark');
      const actualCount = await editButtons.count();
      expect(actualCount).toBe(badgeCount);
    } else {
      expect(badgeCount).toBe(expectedCount);
    }

    await navigateBack(this.page);
    return badgeCount;
  }

  async searchWithinBookmarks(searchTerm: string, personName: string) {
    await this.openPersonCard(personName);

    const dialog = this.getBookmarksDialog();
    const searchInput = this.getModalSearchInput();
    await expect(searchInput).toBeVisible();

    const bookmarks = dialog.getByTitle('Edit Bookmark');

    await expect
      .poll(async () => bookmarks.count(), { timeout: 5000 })
      .toBeGreaterThan(0);
    const allBookmarksBefore = await bookmarks.count();

    await searchInput.fill(searchTerm);

    await expect.poll(async () => bookmarks.count(), { timeout: 5000 }).toBe(0);

    const noResultsBookmarks = await bookmarks.count();
    return {
      allBookmarksBefore,
      noResultsBookmarks,
      searchInput,
    };
  }

  async getEditButtons() {
    return this.getBookmarksDialog().getByTitle('Edit Bookmark');
  }

  async verifyBookmarkInPersonList(personName: string, bookmarkTitle: string) {
    await this.openPersonCard(personName);

    const dialog = this.getBookmarksDialog();
    const bookmarkItem = dialog.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await expect(bookmarkItem).toBeVisible();

    await navigateBack(this.page);
  }

  async verifyBookmarkNotInPersonList(
    personName: string,
    bookmarkTitle: string
  ) {
    await this.openPersonCard(personName);

    const dialog = this.getBookmarksDialog();
    const bookmarkItem = dialog.getByTestId(`bookmark-item-${bookmarkTitle}`);
    await expect(bookmarkItem).not.toBeVisible();

    await navigateBack(this.page);
  }

  /** The dialog autofocuses itself asynchronously; wait for that to land. */
  getFocusedBookmarksDialog() {
    return this.getBookmarksDialog().and(this.page.locator(':focus-within'));
  }

  /** Scoped, because the panel's own search matches the same placeholder. */
  getModalSearchInput() {
    return this.getBookmarksDialog().getByPlaceholder('Search');
  }

  async clickPersonContextMenu(personName: string, menuItemId: string) {
    const personCard = this.getPersonCardElement(personName);
    await expect(personCard).toBeVisible();
    await personCard.click({ button: 'right' });
    await clickContextMenuItem(this.page, menuItemId);
  }
}
