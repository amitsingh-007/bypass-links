import { expect, type Page, type Locator } from '@playwright/test';
import { TEST_TIMEOUTS } from '../constants';

export class BookmarksPanel {
  constructor(readonly page: Page) {}

  async search(query: string) {
    const searchInput = this.getSearchInput();
    await searchInput.fill(query);
    await this.page.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);
  }

  async clearSearch() {
    const searchInput = this.getSearchInput();
    await searchInput.clear();
    await this.page.waitForTimeout(TEST_TIMEOUTS.DEBOUNCE);
  }

  async openFolder(folderName: string) {
    const folder = this.getFolderElement(folderName);
    await expect(folder).toBeVisible();
    await folder.dblclick();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async navigateBack() {
    const backButton = this.page.getByRole('button', { name: 'Back' });
    await expect(backButton).toBeVisible();
    await backButton.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async openBookmarkByDoubleClick(title: string) {
    const bookmark = this.getBookmarkElement(title);
    await expect(bookmark).toBeVisible();
    await bookmark.dblclick();
  }

  async getBookmarkCount(): Promise<number> {
    return this.page.locator('[data-testid^="bookmark-item-"]').count();
  }

  async hoverAvatar(): Promise<Locator> {
    const avatarGroup = this.getAvatarGroup();
    const avatar = avatarGroup.locator('[data-testid^="avatar-"]').first();
    await expect(avatar).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });
    await avatar.hover();

    // Return the first visible dropdown
    const dropdown = this.page
      .locator('[data-testid^="person-dropdown-"]')
      .first();
    await expect(dropdown).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });

    return dropdown;
  }

  getEmptyState(): Locator {
    return this.page.getByText(/no bookmarks/i);
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async verifyBookmarkExists(title: string) {
    const bookmark = this.getBookmarkElement(title);
    await expect(bookmark).toBeVisible();
  }

  async verifyFolderExists(name: string) {
    const folder = this.getFolderElement(name);
    await expect(folder).toBeVisible();
  }

  getSearchInput(): Locator {
    return this.page.getByPlaceholder('Search');
  }

  getHeaderTitle(): Locator {
    return this.page.getByTestId('header-badge');
  }

  getBookmarkCountBadge(): Locator {
    return this.page.getByTestId('header-badge');
  }

  getAvatarGroup(): Locator {
    return this.page.getByTestId('avatar-group');
  }

  private getBookmarkElement(title: string): Locator {
    return this.page.getByTestId(`bookmark-item-${title}`);
  }

  private getFolderElement(name: string): Locator {
    return this.page.getByTestId(`folder-item-${name}`);
  }
}
