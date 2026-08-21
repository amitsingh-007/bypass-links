import {
  clearSearchInput,
  fillSearchInput,
  getHeaderPersonCount,
  parseBadgeCount,
} from '@bypass/shared/tests';
import { expect, type Locator, type Page } from '@playwright/test';

export class PersonsPanel {
  constructor(readonly page: Page) {}

  getPersonItems(): Locator {
    return this.page.locator('[data-testid^="person-item-"]');
  }

  async getPersonCount(): Promise<number> {
    return this.getPersonItems().count();
  }

  async getHeaderPersonCount(): Promise<number> {
    return getHeaderPersonCount(this.page);
  }

  async verifyPersonExists(name: string) {
    const personCard = this.page.getByTestId(`person-item-${name}`);
    await expect(personCard).toBeVisible();
  }

  async verifyPersonNotVisible(name: string) {
    const personCard = this.page.getByTestId(`person-item-${name}`);
    await expect(personCard).not.toBeVisible();
  }

  async openPersonCard(name: string) {
    const personCard = this.page.getByTestId(`person-item-${name}`);
    await expect(personCard).toBeVisible();
    await personCard.click();
    await this.verifyModalVisible();
    await this.waitForBookmarksToLoad();
  }

  async waitForBookmarksToLoad() {
    const modal = this.getModal();
    await modal
      .locator('[data-testid="bookmarks-loading"]')
      .waitFor({ state: 'hidden' })
      .catch(() => null); // Loading indicator may not appear if loading is fast
    await Promise.race([
      modal
        .locator('[data-testid^="bookmark-item-"]')
        .first()
        .waitFor({ state: 'visible' }),
      modal.getByTestId('no-bookmarks-message').waitFor({ state: 'visible' }),
    ]);
  }

  async getBookmarkCountInModal(): Promise<number> {
    const modal = this.getModal();
    const badge = modal.getByTestId('person-bookmark-count-badge');
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    return parseBadgeCount(badgeText ?? '');
  }

  async getBookmarkCountInModalFromList(): Promise<number> {
    const modal = this.getModal();
    return modal.locator('[data-testid^="bookmark-item-"]').count();
  }

  async searchWithinBookmarks(query: string) {
    await fillSearchInput(this.getModal(), query);
  }

  async clearSearchWithinBookmarks() {
    await clearSearchInput(this.getModal());
  }

  async closeModal() {
    const modal = this.getModal();
    const closeButton = modal.getByRole('button', { name: 'Back' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await this.verifyModalClosed();
  }

  async verifyModalVisible() {
    await expect(this.getModal()).toBeVisible();
    // Back button only renders while the modal is open
    const backButton = this.getModal().getByRole('button', { name: 'Back' });
    await expect(backButton).toBeVisible();
  }

  async verifyModalClosed() {
    await expect(this.getModal()).not.toBeAttached();
  }

  async verifyPersonNameInBadge(name: string) {
    const modal = this.getModal();
    const badge = modal.getByTestId('person-bookmark-count-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(name);
  }

  getFolderBadges(): Locator {
    // Folder-name badges, not the person bookmark count badge
    const modal = this.getModal();
    return modal.getByTestId('folder-name-badge');
  }

  getNoBookmarksMessage(): Locator {
    const modal = this.getModal();
    return modal.getByTestId('no-bookmarks-message');
  }

  async verifyRecencySwitchExists() {
    await expect(this.getRecencySwitch()).toBeVisible();
  }

  async toggleRecency() {
    await this.getRecencySwitch().click();
  }

  async getPersonNames(): Promise<string[]> {
    const names = await this.getPersonItems().allTextContents();
    return names.map((name) => name.trim());
  }

  getSearchInput(): Locator {
    return this.page.getByPlaceholder('Search');
  }

  getEditButtons(): Locator {
    return this.getModal().getByTestId('edit-bookmark-button');
  }

  async verifyEditButtonsHidden() {
    const editButtons = this.getEditButtons();
    await expect(editButtons).not.toBeVisible();
  }

  private getModal(): Locator {
    return this.page.getByTestId('bookmarks-list-modal');
  }

  private getRecencySwitch(): Locator {
    return this.page.locator('[data-testid="recency-switch"]');
  }
}
