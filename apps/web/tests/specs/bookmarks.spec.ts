import {
  TEST_BOOKMARKS,
  TEST_FOLDERS,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { test, expect } from '../fixtures/auth-fixture';
import { BookmarksPanel } from '../page-object-models/bookmarks-panel';

test.describe('Bookmarks Panel', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/bookmark-panel');
    // Wait for bookmarks to load or empty state to appear
    await Promise.race([
      authenticatedPage
        .locator('[data-testid^="bookmark-item-"]')
        .first()
        .waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.LONG_WAIT }),
      authenticatedPage
        .getByText(/no bookmarks/i)
        .waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.LONG_WAIT }),
    ]);
  });

  test('should navigate to bookmarks panel and verify header', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    await expect(panel.getSearchInput()).toBeVisible();

    const headerBadge = panel.getBookmarkCountBadge();
    await expect(headerBadge).toBeVisible();
    const text = await headerBadge.textContent();
    expect(text).toMatch(/.+\(\d+\)/);
  });

  test('should display all bookmarks and folders at root level', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    // Verify expected bookmarks at root level
    await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);
    await panel.verifyBookmarkExists(TEST_BOOKMARKS.GITHUB);
    // Verify folders exist
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);
  });

  test('should open folder, verify contents, and navigate back', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const rootCount = await panel.getBookmarkCount();

    await panel.openFolder(TEST_FOLDERS.MAIN);
    // Wait for folder content to load before getting count
    await expect(
      authenticatedPage.locator('[data-testid^="bookmark-item-"]').first()
    ).toBeVisible();
    const folderCount = await panel.getBookmarkCount();
    // Folder count should be different from root count
    expect(folderCount).not.toBe(rootCount);

    await panel.navigateBack();
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);

    const backToRootCount = await panel.getBookmarkCount();
    expect(backToRootCount).toBe(rootCount);
  });

  test('should search bookmarks by title, URL, and update badge count', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const countBefore = await panel.getBookmarkCount();
    const rootBadgeCount = await panel.getBadgeCount();

    // Search by title
    await panel.search('ButtonGroup');
    await panel.verifyBookmarkExists(TEST_BOOKMARKS.GITHUB);

    // Clear and search by URL
    await panel.clearSearch();
    await panel.search('material');
    await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);

    // Clear and verify count restored
    await panel.clearSearch();
    await expect(async () => {
      const countAfter = await panel.getBookmarkCount();
      expect(countAfter).toBe(countBefore);
    }).toPass();

    // Search for React and verify badge count updates
    await panel.search('React');
    const searchBadgeCount = await panel.getBadgeCount();
    expect(searchBadgeCount).toBeLessThanOrEqual(rootBadgeCount);

    // Clear search
    await panel.clearSearch();
  });

  test('should keep folders visible when searching and filter results', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);

    // Verify folders stay visible during search
    await panel.search('nonexistent');
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);

    // Clear and verify filtering works
    await panel.clearSearch();
    await panel.search('React');
    const count = await panel.getBookmarkCount();
    expect(count).toBeGreaterThan(0);

    await panel.clearSearch();
  });

  test('should open bookmark by double-clicking', async ({
    authenticatedPage,
    context,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const initialPages = context.pages();

    // Listen for new page event before triggering the action
    const pagePromise = context.waitForEvent('page');
    await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
    const newPage = await pagePromise;

    // Verify exactly one new page was created
    expect(context.pages().length).toBe(initialPages.length + 1);
    await newPage.close();
  });

  test('should display person avatars with dropdown and navigation', async ({
    authenticatedPage,
  }) => {
    // Verify avatars are displayed
    const avatarGroups = authenticatedPage.getByTestId('avatar-group');
    await expect(avatarGroups.first()).toBeVisible({
      timeout: TEST_TIMEOUTS.LONG_WAIT,
    });

    const panel = new BookmarksPanel(authenticatedPage);

    // Hover and verify dropdown
    const dropdown = await panel.hoverAvatar();
    await expect(dropdown).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });

    // Verify person name in dropdown
    const avatar = dropdown.locator('[data-testid^="dropdown-avatar-"]');
    await expect(avatar).toBeVisible();
    const testId = (await avatar.getAttribute('data-testid')) ?? '';
    const personName = testId.replace('dropdown-avatar-', '');
    expect(personName).toBeTruthy();

    // Click and verify navigation
    const clickedPersonName =
      await panel.clickPersonInDropdownAndGetName(dropdown);
    expect(clickedPersonName).toBeTruthy();
    await authenticatedPage.waitForURL(/persons-panel/);
    const currentUrl = panel.getCurrentUrl();
    expect(currentUrl).toContain('persons-panel');
  });

  test('should display bookmark count badge in header and update on folder navigation', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);

    // Verify badge at root
    const badge = panel.getBookmarkCountBadge();
    await expect(badge).toBeVisible();
    const rootBadgeCount = await panel.getBadgeCount();
    expect(rootBadgeCount).toBeGreaterThan(0);

    // Navigate to folder and verify badge updates
    await panel.openFolder(TEST_FOLDERS.MAIN);
    const folderBadge = panel.getBookmarkCountBadge();
    await expect(folderBadge).toBeVisible();
    const folderBadgeCount = await panel.getBadgeCount();
    expect(folderBadgeCount).toBeGreaterThan(0);
    expect(folderBadgeCount).not.toBe(rootBadgeCount);
  });

  test('should show not-allowed cursor on empty folder and prevent navigation', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    await panel.getEmptyFolder(TEST_FOLDERS.EMPTY);
    await panel.verifyEmptyFolderCannotOpen(TEST_FOLDERS.EMPTY);
  });

  test('should display favicon and URL tooltip on bookmark hover', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);

    // Verify favicon
    const favicon = panel.getFaviconElement(TEST_BOOKMARKS.REACT_DOCS);
    await expect(favicon).toBeVisible();

    // Verify tooltip on hover
    const tooltip = await panel.hoverBookmarkForTooltip(
      TEST_BOOKMARKS.REACT_DOCS
    );
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toBeTruthy();
    expect(tooltipText).toContain('material');
  });
});
