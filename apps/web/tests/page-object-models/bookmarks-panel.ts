import { BookmarksPanelBase, getNumericBadgeValue } from '@bypass/shared/tests';
import { expect, type Locator } from '@playwright/test';

export class BookmarksPanel extends BookmarksPanelBase {
  async navigateBack() {
    const backButton = this.page.getByRole('button', { name: 'Back' });
    await expect(backButton).toBeVisible();
    const initialUrl = this.page.url();
    await backButton.click();
    await expect.poll(() => this.page.url()).not.toBe(initialUrl);
  }

  getFaviconElement(bookmarkTitle: string): Locator {
    const bookmark = this.getBookmarkElement(bookmarkTitle);
    return bookmark.locator('[data-testid="bookmark-favicon"]').first();
  }

  async hoverBookmarkForTooltip(bookmarkTitle: string): Promise<Locator> {
    const favicon = this.getFaviconElement(bookmarkTitle);
    await favicon.hover();
    // shadcn portals tooltips to [data-slot="tooltip-content"]
    const tooltip = this.page.locator('[data-slot="tooltip-content"]').first();
    await expect(tooltip).toBeVisible();
    return tooltip;
  }

  getBookmarkCountBadge(): Locator {
    return this.page.getByTestId('header-badge');
  }

  async getBadgeCount(): Promise<number> {
    return getNumericBadgeValue(this.page, 'header-badge');
  }
}
