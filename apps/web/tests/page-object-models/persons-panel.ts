import {
  clearSearchInput,
  fillSearchInput,
  parseBadgeCount,
  PersonsPanelBase,
} from '@bypass/shared/tests';
import { expect, type Locator } from '@playwright/test';

export class PersonsPanel extends PersonsPanelBase {
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
    const modal = this.getBookmarksDialog();
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
    const badge = this.getBookmarkCountBadge();
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    return parseBadgeCount(badgeText ?? '');
  }

  async getBookmarkCountInModalFromList(): Promise<number> {
    const modal = this.getBookmarksDialog();
    return modal.locator('[data-testid^="bookmark-item-"]').count();
  }

  async searchWithinBookmarks(query: string) {
    await fillSearchInput(this.getBookmarksDialog(), query);
  }

  async clearSearchWithinBookmarks() {
    await clearSearchInput(this.getBookmarksDialog());
  }

  async closeModal() {
    const modal = this.getBookmarksDialog();
    const closeButton = modal.getByRole('button', { name: 'Back' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await this.verifyModalClosed();
  }

  async verifyModalVisible() {
    await expect(this.getBookmarksDialog()).toBeVisible();
    // Back button only renders while the modal is open
    const backButton = this.getBookmarksDialog().getByRole('button', {
      name: 'Back',
    });
    await expect(backButton).toBeVisible();
  }

  async verifyModalClosed() {
    await expect(this.getBookmarksDialog()).not.toBeAttached();
  }

  getFolderBadges(): Locator {
    // Folder-name badges, not the person bookmark count badge
    const modal = this.getBookmarksDialog();
    return modal.getByTestId('folder-name-badge');
  }

  getNoBookmarksMessage(): Locator {
    const modal = this.getBookmarksDialog();
    return modal.getByTestId('no-bookmarks-message');
  }

  async verifyRecencySwitchExists() {
    await expect(this.getRecencySwitch()).toBeVisible();
  }

  async toggleRecency() {
    await this.getRecencySwitch().click();
  }

  getEditButtons(): Locator {
    return this.getBookmarksDialog().getByTestId('edit-bookmark-button');
  }

  async verifyEditButtonsHidden() {
    const editButtons = this.getEditButtons();
    await expect(editButtons).not.toBeVisible();
  }

  private getRecencySwitch(): Locator {
    return this.page.locator('[data-testid="recency-switch"]');
  }
}
