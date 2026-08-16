import { expect, type Locator, type Page } from '@playwright/test';

/**
 * The half of each panel's page object that drives shared components, so a
 * test-id rename in packages/shared is one edit rather than one per app.
 * App-specific navigation stays in the subclasses.
 */
export class BaseBookmarksPanel {
  constructor(readonly page: Page) {}

  getBookmarkElement(title: string): Locator {
    return this.page.getByTestId(`bookmark-item-${title}`);
  }

  getFolderElement(name: string): Locator {
    return this.page.getByTestId(`folder-item-${name}`);
  }

  getBookmarkItems(): Locator {
    return this.page.locator('[data-testid^="bookmark-item-"]');
  }

  getSearchInput(): Locator {
    return this.page.getByPlaceholder('Search');
  }

  getAvatarGroup(): Locator {
    return this.page.getByTestId('avatar-group');
  }

  getFaviconElement(title: string): Locator {
    return this.getBookmarkElement(title)
      .locator('[data-testid="bookmark-favicon"]')
      .first();
  }

  async getBookmarkCount(): Promise<number> {
    return this.getBookmarkItems().count();
  }

  async verifyBookmarkExists(title: string) {
    await expect(this.getBookmarkElement(title)).toBeVisible();
  }

  async verifyFolderExists(name: string) {
    await expect(this.getFolderElement(name)).toBeVisible();
  }
}

export class BasePersonsPanel {
  constructor(readonly page: Page) {}

  getPersonElement(name: string): Locator {
    return this.page.getByTestId(`person-item-${name}`);
  }

  getPersonItems(): Locator {
    return this.page.locator('[data-testid^="person-item-"]');
  }

  getBookmarksDialog(): Locator {
    return this.page.getByTestId('bookmarks-list-modal');
  }

  getRecencySwitch(): Locator {
    return this.page.getByTestId('recency-switch');
  }

  getSearchInput(): Locator {
    return this.page.getByPlaceholder('Search');
  }

  async getPersonCount(): Promise<number> {
    return this.getPersonItems().count();
  }

  async verifyPersonExists(name: string) {
    await expect(this.getPersonElement(name)).toBeVisible();
  }

  async verifyPersonNotVisible(name: string) {
    await expect(this.getPersonElement(name)).not.toBeVisible();
  }
}
