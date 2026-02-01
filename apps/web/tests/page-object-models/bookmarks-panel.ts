import { expect, type Page, type Locator } from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';

export class BookmarksPanel {
  constructor(readonly page: Page) {}

  async search(query: string) {
    const searchInput = this.getSearchInput();
    await searchInput.fill(query);
    // Wait for debounce by checking the search input value is set
    await expect(searchInput).toHaveValue(query);
  }

  async clearSearch() {
    const searchInput = this.getSearchInput();
    await searchInput.clear();
    // Wait for clear by checking the search input is empty
    await expect(searchInput).toHaveValue('');
  }

  async openFolder(folderName: string) {
    const folder = this.getFolderElement(folderName);
    await expect(folder).toBeVisible();
    const initialUrl = this.page.url();
    await folder.dblclick();
    // Wait for navigation by checking URL changed
    await expect.poll(() => this.page.url()).not.toBe(initialUrl);
  }

  async navigateBack() {
    const backButton = this.page.getByRole('button', { name: 'Back' });
    await expect(backButton).toBeVisible();
    const initialUrl = this.page.url();
    await backButton.click();
    // Wait for navigation by checking URL changed
    await expect.poll(() => this.page.url()).not.toBe(initialUrl);
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
    // Verify URL hasn't changed (folder doesn't navigate)
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
    // Wait for element to be stable before clicking
    await expect(dropdownAvatar).toBeEnabled();
    const testId = (await dropdownAvatar.getAttribute('data-testid')) ?? '';
    const personName = testId.replace('dropdown-avatar-', '');
    await dropdownAvatar.click();
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

  getBookmarkCountBadge(): Locator {
    return this.page.getByTestId('header-badge');
  }

  async getBadgeCount(): Promise<number> {
    const badge = this.getBookmarkCountBadge();
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    const match = /\((\d+)\)/.exec(badgeText ?? '');
    const count = match ? Number.parseInt(match[1], 10) : 0;
    return count;
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
