import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import {
  changeImageInDialog,
  clickDialogButton,
  clickContextMenuItem,
  closeDialog,
  countElements,
  fillDialogInput,
  getBadgeCount,
  navigateBack,
  openDialog,
  openPersonCard,
  searchAndVerify,
  toggleSwitch,
  waitForDebounce,
} from './test-utils';

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
    await expect(dialog).toBeHidden();

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
    await expect(dialog).toBeHidden();

    const editedPersonCard = this.page.getByTestId(`person-item-${newName}`);
    await expect(editedPersonCard).toBeVisible();
  }

  async changePersonImage(personName: string, newImageUrl: string) {
    const dialog = await this.openEditPersonDialog(personName);
    await expect(dialog).toBeVisible();

    await changeImageInDialog(this.page, dialog, newImageUrl);

    await clickDialogButton(dialog, 'Save');
    await expect(dialog).toBeHidden();

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

    await closeDialog(this.page, dialog);
  }

  async openPersonCard(personName: string) {
    await openPersonCard(this.page, personName);
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

    const searchInput = this.page
      .locator('.mantine-Modal-content')
      .getByPlaceholder('Search');

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

  async verifyRecencySwitchExists() {
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

    const recencySwitch = this.page.getByRole('switch', { name: 'Recency' });
    const count = await recencySwitch.count();
    expect(count).toBeGreaterThan(0);

    return recencySwitch;
  }

  async toggleRecency() {
    await toggleSwitch(this.page, 'Recency');
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
    const badge = this.page
      .locator('.mantine-Badge-label')
      .filter({ hasText: badgeName });
    await expect(badge).toBeVisible();
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
