import {
  BaseBookmarksPanel,
  clickDropdownPersonAndGetName,
  dblclickBookmark,
  getNumericBadgeValue,
} from '@bypass/shared/tests';
import { expect, type Locator } from '@playwright/test';

export class BookmarksPanel extends BaseBookmarksPanel {
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
    await dblclickBookmark(this.page, title);
  }

  async hoverAvatar(): Promise<Locator> {
    const avatarGroup = this.getAvatarGroup();
    const avatar = avatarGroup.locator('[data-testid^="avatar-"]').first();
    await expect(avatar).toBeVisible();
    await avatar.hover();

    // Return the first visible dropdown
    const dropdown = this.page
      .locator('[data-testid^="person-dropdown-"]')
      .first();
    await expect(dropdown).toBeVisible();

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
    return clickDropdownPersonAndGetName(dropdown);
  }

  async hoverBookmarkForTooltip(bookmarkTitle: string): Promise<Locator> {
    // Hover over the favicon area to trigger the tooltip
    const favicon = this.getFaviconElement(bookmarkTitle);
    await favicon.hover();
    // Wait for tooltip to appear - shadcn renders tooltip with data-slot="tooltip-content"
    const tooltip = this.page.locator('[data-slot="tooltip-content"]').first();
    await expect(tooltip).toBeVisible();
    return tooltip;
  }

  getBookmarkCountBadge(): Locator {
    return this.page.getByTestId('header-badge');
  }

  async getBadgeCount(): Promise<number> {
    return getNumericBadgeValue(this.page, 'header-badge', {
      fallbackToAnyNumber: true,
    });
  }
}
