import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import {
  clickDialogButton,
  clickContextMenuItem,
  countElements,
  fillDialogInput,
  getBadgeCount,
  navigateBack,
  openDialog,
  searchAndVerify,
  waitForDebounce,
} from './test-utils';

const openPersonCard = async (page: Page, personName: string) => {
  const personCard = page.getByTestId(`person-item-${personName}`);
  await expect(personCard).toBeVisible();
  await personCard.click();
};

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
  page: Page,
  imagePickerDialog: ReturnType<Page['getByRole']>,
  imageUrl: string
) => {
  const imageUrlInput = imagePickerDialog.getByPlaceholder('Enter image url');
  await imageUrlInput.fill(imageUrl);

  const saveCroppedButton = page.getByTestId('save-cropped-image');
  await expect(saveCroppedButton).toBeEnabled({
    timeout: TEST_TIMEOUTS.AUTH,
  });
  await saveCroppedButton.click();

  const uploadOverlay = page.getByTestId('uploading-overlay');
  await expect(uploadOverlay).toBeVisible();

  await expect(imagePickerDialog).toBeHidden({ timeout: TEST_TIMEOUTS.AUTH });
};

const changeImageInDialog = async (
  page: Page,
  dialog: ReturnType<Page['getByRole']>,
  imageUrl: string
) => {
  const imagePickerDialog = await openImagePicker(page, dialog);
  await uploadImage(page, imagePickerDialog, imageUrl);
};

export class PersonsPanel {
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
        selector: '[data-testid^="person-item-"]',
      });
    }
  }

  async clearSearch() {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.clear();
    await waitForDebounce(this.page);
  }

  async getPersonCount() {
    return countElements(this.page, '[data-testid^="person-item-"]');
  }

  async openAddPersonDialog() {
    return openDialog(this.page, 'Add', 'Add Person');
  }

  async addPerson(name: string, imageUrl?: string) {
    const dialog = await this.openAddPersonDialog();
    await fillDialogInput(dialog, 'Enter name', name);

    if (imageUrl) {
      await changeImageInDialog(this.page, dialog, imageUrl);
    }

    await clickDialogButton(dialog, 'Save');
    await waitForDebounce(this.page);
    // Wait for dialog to close with longer timeout
    await expect(dialog).toBeHidden({ timeout: TEST_TIMEOUTS.LONG_WAIT });

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
    await waitForDebounce(this.page);
    await expect(dialog).toBeHidden({ timeout: TEST_TIMEOUTS.LONG_WAIT });

    const editedPersonCard = this.page.getByTestId(`person-item-${newName}`);
    await expect(editedPersonCard).toBeVisible();
  }

  async changePersonImage(personName: string, newImageUrl: string) {
    const dialog = await this.openEditPersonDialog(personName);
    await expect(dialog).toBeVisible();

    await changeImageInDialog(this.page, dialog, newImageUrl);

    await clickDialogButton(dialog, 'Save');
    await waitForDebounce(this.page);
    await expect(dialog).toBeHidden({ timeout: TEST_TIMEOUTS.LONG_WAIT });

    const personCardAfter = this.page.getByTestId(`person-item-${personName}`);
    await expect(personCardAfter).toBeVisible();
  }

  async deletePerson(personName: string) {
    const personCard = this.page.getByTestId(`person-item-${personName}`);
    await expect(personCard).toBeVisible();

    await personCard.click({ button: 'right' });
    await clickContextMenuItem(this.page, 'delete');

    // Wait for success notification to appear and verify
    const notification = this.page.getByText('Person deleted successfully');
    await expect(notification).toBeVisible();

    // Verify person is no longer visible (auto-retrying assertion)
    await expect(personCard).not.toBeVisible();
  }

  async verifyAvatarVisibleInEditDialog(personName: string) {
    const dialog = await this.openEditPersonDialog(personName);
    await expect(dialog).toBeVisible();

    const avatar = dialog.locator('img');
    await expect(avatar).toBeVisible();

    const closeButton = this.page.locator('[data-slot="dialog-close"]');
    await closeButton.click();
    await expect(dialog).toBeHidden();
  }

  async openPersonCard(personName: string) {
    await openPersonCard(this.page, personName);
  }

  async ensureAtRoot() {
    await this.page.goto('/popup.html');
    const personsButton = this.page.getByRole('button', { name: 'Persons' });
    await expect(personsButton).toBeVisible();
    await personsButton.click();
    await expect(this.page.getByPlaceholder('Search')).toBeVisible();
    // Wait for at least one person to be visible
    await expect(
      this.page.locator('[data-testid^="person-item-"]').first()
    ).toBeVisible();
  }

  async navigateBack() {
    await navigateBack(this.page);
  }

  async verifyBadgeCount(personName: string, expectedCount?: number) {
    await openPersonCard(this.page, personName);
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

    const badgeCount = await getBadgeCount(this.page, personName);

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
    await openPersonCard(this.page, personName);
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

    const dialog = this.page.getByRole('dialog');
    const searchInput = dialog.getByPlaceholder('Search');

    const allBookmarksBefore = await this.page
      .getByTitle('Edit Bookmark')
      .count();
    expect(allBookmarksBefore).toBeGreaterThan(0);

    await searchInput.fill(searchTerm);
    await waitForDebounce(this.page);

    const noResultsBookmarks = await this.page
      .getByTitle('Edit Bookmark')
      .count();
    return {
      allBookmarksBefore,
      noResultsBookmarks,
      searchInput,
    };
  }

  async getPersonNames(): Promise<string[]> {
    const personCards = this.page.locator('[data-testid^="person-item-"]');
    const personCount = await personCards.count();
    const personNames: string[] = [];
    for (let i = 0; i < personCount; i++) {
      const text = await personCards.nth(i).textContent();
      if (text) {
        personNames.push(text.trim());
      }
    }
    return personNames;
  }

  async verifyBadgeVisible(badgeName: string) {
    const badge = this.page.getByTestId('person-bookmark-count-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(badgeName);
  }

  async getEditButtons() {
    return this.page.getByTitle('Edit Bookmark');
  }

  async verifyPersonCardVisible(personName: string) {
    const personCard = this.page.getByTestId(`person-item-${personName}`);
    await expect(personCard).toBeVisible();
  }

  // ============ Verification Helpers ============

  async verifyPersonExists(personName: string) {
    await this.verifyPersonCardVisible(personName);
  }

  async verifyBookmarkInPersonList(personName: string, bookmarkTitle: string) {
    await openPersonCard(this.page, personName);

    const bookmarkItem = this.page.getByTestId(
      `bookmark-item-${bookmarkTitle}`
    );
    await expect(bookmarkItem).toBeVisible();

    await navigateBack(this.page);
  }

  async verifyBookmarkNotInPersonList(
    personName: string,
    bookmarkTitle: string
  ) {
    await openPersonCard(this.page, personName);

    const bookmarkItem = this.page.getByTestId(
      `bookmark-item-${bookmarkTitle}`
    );
    await expect(bookmarkItem).not.toBeVisible();

    await navigateBack(this.page);
  }

  // ============ Selector Encapsulation ============

  getPersonCardElement(personName: string) {
    return this.page.getByTestId(`person-item-${personName}`);
  }

  getSearchInput() {
    return this.page.getByPlaceholder('Search');
  }

  // ============ Composite Operations ============

  async clickPersonContextMenu(personName: string, menuItemId: string) {
    const personCard = this.getPersonCardElement(personName);
    await expect(personCard).toBeVisible();
    await personCard.click({ button: 'right' });
    await clickContextMenuItem(this.page, menuItemId);
  }
}
