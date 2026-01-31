import { expect, type Locator, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';

export class PersonsPanel {
  constructor(readonly page: Page) {}

  async search(query: string) {
    const searchInput = this.getSearchInput();
    await searchInput.fill(query);
    // Wait for debounce - input value is set and debounce completes
    await expect(searchInput).toHaveValue(query);
    // Wait for debounce to complete (Search component uses 200ms debounce)
    await this.page.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);
  }

  async clearSearch() {
    const searchInput = this.getSearchInput();
    await searchInput.clear();
    // Wait for debounce - input is cleared and debounce completes
    await expect(searchInput).toHaveValue('');
    // Wait for debounce to complete (Search component uses 200ms debounce)
    await this.page.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);
  }

  async getPersonCount(): Promise<number> {
    return this.page.locator('[data-testid^="person-item-"]').count();
  }

  async getHeaderPersonCount(): Promise<number> {
    const headerBadge = this.page.getByTestId('header-badge');
    await expect(headerBadge).toBeVisible();
    const headerText = await headerBadge.textContent();
    const match = /\((\d+)\)/.exec(headerText ?? '');
    return match ? Number.parseInt(match[1], 10) : 0;
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
    // Wait for modal to be visible and bookmarks to load
    await this.verifyModalVisible();
    // Wait for bookmarks to load (longer timeout for async data loading)
    await this.waitForBookmarksToLoad();
  }

  async waitForBookmarksToLoad(timeout = TEST_TIMEOUTS.LONG_WAIT) {
    const modal = this.getModal();
    // First wait for loading to complete
    await modal
      .locator('[data-testid="bookmarks-loading"]')
      .waitFor({ state: 'hidden', timeout })
      .catch(() => null); // Loading indicator may not appear if loading is fast
    // Then wait for either bookmarks to appear OR the "no bookmarks" message
    await Promise.race([
      modal
        .locator('[data-testid^="bookmark-item-"]')
        .first()
        .waitFor({ state: 'visible', timeout }),
      modal
        .getByTestId('no-bookmarks-message')
        .waitFor({ state: 'visible', timeout }),
    ]);
  }

  async getBookmarkCountInModal(): Promise<number> {
    const modal = this.getModal();
    const badge = modal.getByTestId('person-bookmark-count-badge');
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    const match = /\((\d+)\)/.exec(badgeText ?? '');
    return match ? Number.parseInt(match[1], 10) : 0;
  }

  async getBookmarkCountInModalFromList(): Promise<number> {
    const modal = this.getModal();
    return modal.locator('[data-testid^="bookmark-item-"]').count();
  }

  async searchWithinBookmarks(query: string) {
    const modal = this.getModal();
    const searchInput = modal.getByPlaceholder('Search');
    await searchInput.fill(query);
    // Wait for debounce - input value is set and debounce completes
    await expect(searchInput).toHaveValue(query);
    // Wait for debounce to complete (Search component uses 200ms debounce)
    await this.page.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);
  }

  async clearSearchWithinBookmarks() {
    const modal = this.getModal();
    const searchInput = modal.getByPlaceholder('Search');
    await searchInput.clear();
    // Wait for debounce - input is cleared and debounce completes
    await expect(searchInput).toHaveValue('');
    // Wait for debounce to complete (Search component uses 200ms debounce)
    await this.page.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);
  }

  async closeModal() {
    const modal = this.getModal();
    const closeButton = modal.getByRole('button', { name: 'Back' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    // Wait for modal to be closed
    await this.verifyModalClosed();
  }

  async verifyModalVisible() {
    // Check that modal content is present by looking for the Back button
    // which should only be visible when the modal is open
    const modal = this.getModal();
    await expect(modal).toBeAttached();
    const backButton = modal.getByRole('button', { name: 'Back' });
    await expect(backButton).toBeVisible();
  }

  async verifyModalClosed() {
    // When modal is closed, the Back button should not be visible
    // Mantine keeps the modal in DOM but hides it with CSS
    const modal = this.getModal();
    const backButton = modal.getByRole('button', { name: 'Back' });
    await expect(backButton).not.toBeVisible();
  }

  async verifyPersonNameInBadge(name: string) {
    const modal = this.getModal();
    // Check that the person name appears in the bookmark count badge
    const badge = modal.getByTestId('person-bookmark-count-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(name);
  }

  getFolderBadges(): Locator {
    // Returns badges showing folder names (violet badges in bookmark rows)
    // These are distinct from the person bookmark count badge
    const modal = this.getModal();
    return modal.getByTestId('folder-name-badge');
  }

  getNoBookmarksMessage(): Locator {
    const modal = this.getModal();
    return modal.getByTestId('no-bookmarks-message');
  }

  getSearchInput(): Locator {
    return this.page.getByPlaceholder('Search');
  }

  private getModal(): Locator {
    return this.page.getByTestId('bookmarks-list-modal');
  }
}
