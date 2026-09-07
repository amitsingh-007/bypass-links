import {
  TEST_BOOKMARKS,
  TEST_FOLDERS,
  clickDropdownPersonAndGetName,
  fillSearchInput,
  clearSearchInput,
  openNewPageFromAction,
} from '@bypass/shared/tests';

import { test, expect } from '../fixtures/base-fixture';
import { BookmarksPanel } from '../page-object-models/bookmarks-panel';

test.describe('Bookmarks Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bookmark-panel');
    await Promise.race([
      page
        .locator('[data-testid^="bookmark-item-"]')
        .first()
        .waitFor({ state: 'visible' }),
      page.getByText(/no bookmarks/i).waitFor({ state: 'visible' }),
    ]);
  });

  test('should navigate to bookmarks panel and verify header', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);
    await expect(panel.getSearchInput()).toBeVisible();

    const headerBadge = panel.getBookmarkCountBadge();
    await expect(headerBadge).toBeVisible();
    const text = await headerBadge.textContent();
    expect(text).toMatch(/.+\(\d+\)/);
  });

  test('should display all bookmarks and folders at root level', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);
    await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);
    await panel.verifyBookmarkExists(TEST_BOOKMARKS.GITHUB);
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);
  });

  test('should open folder, verify contents, and navigate back', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);
    const rootCount = await panel.getBookmarkCount();

    await panel.openFolder(TEST_FOLDERS.MAIN);
    await expect(
      page.locator('[data-testid^="bookmark-item-"]').first()
    ).toBeVisible();
    const folderCount = await panel.getBookmarkCount();
    expect(folderCount).not.toBe(rootCount);

    await panel.navigateBack();
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);

    const backToRootCount = await panel.getBookmarkCount();
    expect(backToRootCount).toBe(rootCount);
  });

  test('should search bookmarks by title, URL, and update badge count', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);
    const countBefore = await panel.getBookmarkCount();
    const rootBadgeCount = await panel.getBadgeCount();

    await test.step('search by title', async () => {
      await fillSearchInput(page, 'ButtonGroup');
      await panel.verifyBookmarkExists(TEST_BOOKMARKS.GITHUB);
      await clearSearchInput(page);
    });

    await test.step('search by url', async () => {
      await fillSearchInput(page, 'material');
      await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);
    });

    await test.step('clearing restores the full count', async () => {
      await clearSearchInput(page);
      await expect(async () => {
        const countAfter = await panel.getBookmarkCount();
        expect(countAfter).toBe(countBefore);
      }).toPass();
    });

    await test.step('badge count narrows with the search', async () => {
      await fillSearchInput(page, 'React');
      const searchBadgeCount = await panel.getBadgeCount();
      expect(searchBadgeCount).toBeLessThanOrEqual(rootBadgeCount);
      await clearSearchInput(page);
    });
  });

  test('should keep folders visible when searching and filter results', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);

    await fillSearchInput(page, 'nonexistent');
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);

    await clearSearchInput(page);
    await fillSearchInput(page, 'React');
    const count = await panel.getBookmarkCount();
    expect(count).toBeGreaterThan(0);

    await clearSearchInput(page);
  });

  test('should open bookmark by double-clicking', async ({ page, context }) => {
    const panel = new BookmarksPanel(page);
    const newPage = await openNewPageFromAction(context, async () => {
      await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
    });
    await newPage.close();
  });

  test('should display person avatars with dropdown and navigation', async ({
    page,
  }) => {
    const avatarGroups = page.getByTestId('avatar-group');
    await expect(avatarGroups.first()).toBeVisible();

    const panel = new BookmarksPanel(page);

    const dropdown = await panel.hoverAvatar();
    await expect(dropdown).toBeVisible();

    const clickedPersonName = await clickDropdownPersonAndGetName(dropdown);
    expect(clickedPersonName).not.toBe('');
    await page.waitForURL(/persons-panel/);
    expect(page.url()).toContain('persons-panel');
  });

  test('should display bookmark count badge in header and update on folder navigation', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);

    const badge = panel.getBookmarkCountBadge();
    await expect(badge).toBeVisible();
    const rootBadgeCount = await panel.getBadgeCount();
    expect(rootBadgeCount).toBeGreaterThan(0);

    await panel.openFolder(TEST_FOLDERS.MAIN);
    const folderBadge = panel.getBookmarkCountBadge();
    await expect(folderBadge).toBeVisible();
    const folderBadgeCount = await panel.getBadgeCount();
    expect(folderBadgeCount).toBeGreaterThan(0);
    expect(folderBadgeCount).not.toBe(rootBadgeCount);
  });

  test('should show not-allowed cursor on empty folder and prevent navigation', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);
    await panel.getEmptyFolder(TEST_FOLDERS.EMPTY);
    await panel.verifyEmptyFolderCannotOpen(TEST_FOLDERS.EMPTY);
  });

  test('should display favicon and URL tooltip on bookmark hover', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);

    const favicon = panel.getFaviconElement(TEST_BOOKMARKS.REACT_DOCS);
    await expect(favicon).toBeVisible();

    const tooltip = await panel.hoverBookmarkForTooltip(
      TEST_BOOKMARKS.REACT_DOCS
    );
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).not.toBeNull();
    if (!tooltipText) {
      throw new Error('Expected bookmark tooltip text to be present');
    }
    expect(tooltipText).toContain('material');
  });
});
