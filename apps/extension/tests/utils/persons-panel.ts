import { expect, type Page } from '@playwright/test';
import {
  changeImageInDialog,
  clickDialogButton,
  closeDialog,
  countElements,
  fillDialogInput,
  getBadgeCount,
  navigateBack,
  openDialog,
  openPersonCard,
  rightClickAndSelectOption,
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
        selector: '[data-person-uid]',
      });
    }
  }

  async clearSearch() {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.clear();
    await waitForDebounce(this.page);
  }

  async getPersonCount() {
    return countElements(this.page, '[data-person-uid]');
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

    const newPersonCard = this.page
      .locator('[data-person-uid]')
      .filter({ hasText: name });
    await expect(newPersonCard).toBeVisible();
  }

  async openEditPersonDialog(personName: string) {
    await rightClickAndSelectOption(
      this.page,
      '[data-person-uid]',
      personName,
      'Edit'
    );
    return this.page.getByRole('dialog', { name: 'Edit Person' });
  }

  async editPersonName(originalName: string, newName: string) {
    const dialog = await this.openEditPersonDialog(originalName);
    const nameInput = dialog.getByPlaceholder('Enter name');
    await nameInput.fill(newName);

    await clickDialogButton(dialog, 'Save');
    await expect(dialog).toBeHidden();

    const editedPersonCard = this.page
      .locator('[data-person-uid]')
      .filter({ hasText: newName });
    await expect(editedPersonCard).toBeVisible();
  }

  async changePersonImage(personName: string, newImageUrl: string) {
    const dialog = await this.openEditPersonDialog(personName);
    await expect(dialog).toBeVisible();

    await changeImageInDialog(this.page, dialog, newImageUrl);

    await clickDialogButton(dialog, 'Save');
    await expect(dialog).toBeHidden();

    const personCardAfter = this.page
      .locator('[data-person-uid]')
      .filter({ hasText: personName });
    await expect(personCardAfter).toBeVisible();
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
    await this.page.waitForTimeout(500);

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
    await this.page.waitForTimeout(500);

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
    await this.page.waitForTimeout(500);

    const recencySwitch = this.page.getByRole('switch', { name: 'Recency' });
    const count = await recencySwitch.count();
    expect(count).toBeGreaterThan(0);

    return recencySwitch;
  }

  async toggleRecency() {
    await toggleSwitch(this.page, 'Recency');
  }

  async getPersonNames(): Promise<string[]> {
    const personCards = this.page.locator('[data-person-uid]');
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
    const personCard = this.page
      .locator('[data-person-uid]')
      .filter({ hasText: personName });
    await expect(personCard).toBeVisible();
  }
}
