import {
  BasePersonsPanel,
  BOOKMARKS_MODAL_TEST_ID,
  clearSearchInput,
  fillSearchInput,
  getHeaderPersonCount,
  parseBadgeCount,
  verifyModalClosed,
  verifyModalVisible,
} from '@bypass/shared/tests';
import { expect, type Locator } from '@playwright/test';

export class PersonsPanel extends BasePersonsPanel {
  async getHeaderPersonCount(): Promise<number> {
    return getHeaderPersonCount(this.page);
  }

  async openPersonCard(name: string) {
    const personCard = this.getPersonElement(name);
    await expect(personCard).toBeVisible();
    await personCard.click();
    // Wait for modal to be visible and bookmarks to load
    await this.verifyModalVisible();
    // Wait for bookmarks to load (longer timeout for async data loading)
    await this.waitForBookmarksToLoad();
  }

  async waitForBookmarksToLoad() {
    const modal = this.getBookmarksDialog();
    // First wait for loading to complete
    await modal
      .locator('[data-testid="bookmarks-loading"]')
      .waitFor({ state: 'hidden' })
      .catch(() => null); // Loading indicator may not appear if loading is fast
    // Then wait for either bookmarks to appear OR the "no bookmarks" message
    await Promise.race([
      modal
        .locator('[data-testid^="bookmark-item-"]')
        .first()
        .waitFor({ state: 'visible' }),
      modal.getByTestId('no-bookmarks-message').waitFor({ state: 'visible' }),
    ]);
  }

  async getBookmarkCountInModal(): Promise<number> {
    const modal = this.getBookmarksDialog();
    const badge = modal.getByTestId('person-bookmark-count-badge');
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
    await verifyModalVisible(this.page, BOOKMARKS_MODAL_TEST_ID);
    // Back button only renders while the modal is open
    const backButton = this.getBookmarksDialog().getByRole('button', {
      name: 'Back',
    });
    await expect(backButton).toBeVisible();
  }

  async verifyModalClosed() {
    await verifyModalClosed(this.page, BOOKMARKS_MODAL_TEST_ID);
  }

  async verifyPersonNameInBadge(name: string) {
    const modal = this.getBookmarksDialog();
    const badge = modal.getByTestId('person-bookmark-count-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(name);
  }

  getFolderBadges(): Locator {
    // Returns badges showing folder names (violet badges in bookmark rows)
    // These are distinct from the person bookmark count badge
    const modal = this.getBookmarksDialog();
    return modal.getByTestId('folder-name-badge');
  }

  getNoBookmarksMessage(): Locator {
    const modal = this.getBookmarksDialog();
    return modal.getByTestId('no-bookmarks-message');
  }

  private getRecencySwitch(): Locator {
    return this.page.getByTestId('recency-switch');
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

  getEditButtons(): Locator {
    return this.getBookmarksDialog().getByTestId('edit-bookmark-button');
  }

  async verifyEditButtonsHidden() {
    const editButtons = this.getEditButtons();
    await expect(editButtons).not.toBeVisible();
  }
}
