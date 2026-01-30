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

  async getEmptyFolder(folderName: string): Promise<Locator> {
    const folder = this.getFolderElement(folderName);
    await expect(folder).toBeVisible();
    const cursor = await folder.evaluate(
      (el) => window.getComputedStyle(el).cursor
    );
    expect(cursor).toBe('not-allowed');
    return folder;
  }

  async verifyEmptyFolderCannotOpen(folderName: string): Promise<void> {
    const folder = this.getFolderElement(folderName);
    const initialUrl = this.page.url();
    await folder.dblclick();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
    expect(this.page.url()).toBe(initialUrl);
  }

  async clickPersonInDropdownAndGetName(dropdown: Locator): Promise<string> {
    const dropdownAvatar = dropdown.locator(
      '[data-testid^="dropdown-avatar-"]'
    );
    await dropdownAvatar.waitFor({
      state: 'visible',
      timeout: TEST_TIMEOUTS.IMAGE_LOAD,
    });
    await this.page.waitForTimeout(300);
    const testId = (await dropdownAvatar.getAttribute('data-testid')) ?? '';
    const personName = testId.replace('dropdown-avatar-', '');
    await dropdownAvatar.click({ force: true });
    return personName;
  }

  getFaviconElement(bookmarkTitle: string): Locator {
    const bookmark = this.getBookmarkElement(bookmarkTitle);
    return bookmark.locator('[data-testid="bookmark-favicon"]').first();
  }

  async hoverBookmarkForTooltip(bookmarkTitle: string): Promise<Locator> {
    // Hover over the favicon area to trigger the tooltip
    const favicon = this.getFaviconElement(bookmarkTitle);
    await favicon.hover();
    // Wait for tooltip to appear - Mantine renders tooltip with role="tooltip"
    const tooltip = this.page.locator('[role="tooltip"]').first();
    await expect(tooltip).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });
    return tooltip;
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
