import { expect, type Page } from '@playwright/test';

import { getNumericBadgeValue } from './test-helpers';

/** Locators and checks shared by the extension and web bookmarks panels. */
export class BookmarksPanelBase {
  constructor(readonly page: Page) {}

  getBookmarkElement(title: string) {
    return this.page.getByTestId(`bookmark-item-${title}`);
  }

  getFolderElement(name: string) {
    return this.page.getByTestId(`folder-item-${name}`);
  }

  getBookmarkItems() {
    return this.page.locator('[data-testid^="bookmark-item-"]');
  }

  getSearchInput() {
    return this.page.getByPlaceholder('Search');
  }

  getAvatarGroup() {
    return this.page.getByTestId('avatar-group');
  }

  async getBookmarkCount() {
    return this.getBookmarkItems().count();
  }

  /** Double-clicks the title, not the row: it fills the row width, so it cannot shift under a person hover card while avatars load. */
  async openBookmarkByDoubleClick(title: string) {
    await this.getBookmarkElement(title)
      .getByTestId(`bookmark-title-${title}`)
      .dblclick();
  }

  async verifyBookmarkExists(title: string) {
    await expect(this.getBookmarkElement(title)).toBeVisible();
  }

  async verifyFolderExists(name: string) {
    await expect(this.getFolderElement(name)).toBeVisible();
  }

  /** Hovers the first tagged avatar and returns the person dropdown it opens. */
  async hoverAvatar() {
    const avatar = this.getAvatarGroup()
      .locator('[data-testid^="avatar-"]')
      .first();
    await expect(avatar).toBeVisible();
    await avatar.hover();

    const dropdown = this.page
      .locator('[data-testid^="person-dropdown-"]')
      .first();
    await expect(dropdown).toBeVisible();
    return dropdown;
  }
}

/** Locators and checks shared by the extension and web persons panels. */
export class PersonsPanelBase {
  constructor(readonly page: Page) {}

  getPersonItems() {
    return this.page.locator('[data-testid^="person-item-"]');
  }

  getPersonCardElement(name: string) {
    return this.page.getByTestId(`person-item-${name}`);
  }

  getSearchInput() {
    return this.page.getByPlaceholder('Search');
  }

  getBookmarksDialog() {
    return this.page.getByTestId('bookmarks-list-modal');
  }

  getBookmarkCountBadge() {
    return this.getBookmarksDialog().getByTestId('person-bookmark-count-badge');
  }

  async getPersonCount() {
    return this.getPersonItems().count();
  }

  async getPersonNames() {
    const texts = await this.getPersonItems().allTextContents();
    return texts.map((text) => text.trim()).filter(Boolean);
  }

  async getHeaderPersonCount() {
    return getNumericBadgeValue(this.page, 'header-badge');
  }

  async verifyPersonExists(name: string) {
    await expect(this.getPersonCardElement(name)).toBeVisible();
  }

  async verifyPersonNameInBadge(name: string) {
    const badge = this.getBookmarkCountBadge();
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(name);
  }
}
