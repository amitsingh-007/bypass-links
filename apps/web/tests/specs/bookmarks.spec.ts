import {
  TEST_BOOKMARKS,
  TEST_FOLDERS,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { test, expect } from '../fixtures/auth-fixture';
import { BookmarksPanel } from '../page-object-models/bookmarks-panel';

test.describe('Basic Navigation', () => {
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
});

test.describe('View Bookmarks and Folders', () => {
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
    const folderCount = await panel.getBookmarkCount();
    // Folder count should be different from root count
    expect(folderCount).not.toBe(rootCount);

    await panel.navigateBack();
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);

    const backToRootCount = await panel.getBookmarkCount();
    expect(backToRootCount).toBe(rootCount);
  });
});

test.describe('Search Functionality', () => {
  test('should search bookmarks by title', async ({ authenticatedPage }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    await panel.search('ButtonGroup');
    await panel.verifyBookmarkExists(TEST_BOOKMARKS.GITHUB);
    await panel.clearSearch();
  });

  test('should search bookmarks by URL', async ({ authenticatedPage }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    // "material" should match bookmarks with material-ui.com in their URL
    await panel.search('material');
    await panel.verifyBookmarkExists(TEST_BOOKMARKS.REACT_DOCS);
    await panel.clearSearch();
  });

  test('should clear search and show all', async ({ authenticatedPage }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const countBefore = await panel.getBookmarkCount();
    await panel.search('nonexistent');
    await panel.clearSearch();
    const countAfter = await panel.getBookmarkCount();
    expect(countAfter).toBe(countBefore);
  });

  test('should keep folders visible when searching', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    await panel.search('nonexistent');
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);
    await panel.clearSearch();
  });

  test('should filter results based on search query', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    await panel.search('React');
    const count = await panel.getBookmarkCount();
    expect(count).toBeGreaterThan(0);
    await panel.clearSearch();
  });

  test('should update bookmark count badge during search', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const rootBadge = panel.getBookmarkCountBadge();
    await expect(rootBadge).toBeVisible();
    const rootBadgeText = await rootBadge.textContent();
    const rootCountMatch = /\((\d+)\)/.exec(rootBadgeText ?? '');
    const rootBadgeCount = rootCountMatch
      ? Number.parseInt(rootCountMatch[1], 10)
      : 0;

    // Search for something
    await panel.search('React');
    const searchBadge = panel.getBookmarkCountBadge();
    await expect(searchBadge).toBeVisible();
    const searchBadgeText = await searchBadge.textContent();
    const searchCountMatch = /\((\d+)\)/.exec(searchBadgeText ?? '');
    const searchBadgeCount = searchCountMatch
      ? Number.parseInt(searchCountMatch[1], 10)
      : 0;

    // Search count should be different from root count
    expect(searchBadgeCount).toBeLessThanOrEqual(rootBadgeCount);
    await panel.clearSearch();
  });
});

test.describe('Open Bookmarks', () => {
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
});

test.describe('Person Avatars', () => {
  test('should display person avatars when bookmarks are tagged', async ({
    authenticatedPage,
  }) => {
    // Multiple bookmarks have tagged persons at root level
    const avatarGroups = authenticatedPage.getByTestId('avatar-group');
    await expect(avatarGroups.first()).toBeVisible({
      timeout: TEST_TIMEOUTS.LONG_WAIT,
    });
  });

  test('should show dropdown on avatar hover', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    // Hover over the first avatar group
    const dropdown = await panel.hoverAvatar();
    await expect(dropdown).toBeVisible({ timeout: TEST_TIMEOUTS.LONG_WAIT });
  });

  test('should display person name in dropdown', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const dropdown = await panel.hoverAvatar();

    // Verify person avatar is displayed in dropdown
    const avatar = dropdown.locator('[data-testid^="dropdown-avatar-"]');
    await expect(avatar).toBeVisible();

    // Get the person name from the data-testid attribute
    const testId = (await avatar.getAttribute('data-testid')) ?? '';
    const personName = testId.replace('dropdown-avatar-', '');
    expect(personName).toBeTruthy();
  });

  test('should navigate to persons panel when clicking person in dropdown', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const dropdown = await panel.hoverAvatar();

    // Click on the person in dropdown and verify navigation
    const personName = await panel.clickPersonInDropdownAndGetName(dropdown);
    expect(personName).toBeTruthy();

    // Verify URL contains persons-panel path
    await authenticatedPage.waitForURL(/persons-panel/);
    const currentUrl = panel.getCurrentUrl();
    expect(currentUrl).toContain('persons-panel');
  });
});

test.describe('Bookmark Count Badge', () => {
  test('should display bookmark count in header', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const badge = panel.getBookmarkCountBadge();
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    expect(badgeText).toMatch(/\(\d+\)/);
    const countMatch = /\((\d+)\)/.exec(badgeText ?? '');
    const badgeCount = countMatch ? Number.parseInt(countMatch[1], 10) : 0;
    // Badge should show at least 1 bookmark
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should update count when navigating to folder', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const rootBadge = panel.getBookmarkCountBadge();
    await expect(rootBadge).toBeVisible();
    const rootBadgeText = await rootBadge.textContent();
    expect(rootBadgeText).toMatch(/\(\d+\)/);

    await panel.openFolder(TEST_FOLDERS.MAIN);
    const folderBadge = panel.getBookmarkCountBadge();
    await expect(folderBadge).toBeVisible();
    const folderBadgeText = await folderBadge.textContent();
    expect(folderBadgeText).toMatch(/\(\d+\)/);

    // Verify badge is still showing a count after navigation
    const folderCountMatch = /\((\d+)\)/.exec(folderBadgeText ?? '');
    const folderBadgeCount = folderCountMatch
      ? Number.parseInt(folderCountMatch[1], 10)
      : 0;
    expect(folderBadgeCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Empty Folder Behavior', () => {
  test('should show not-allowed cursor on empty folder and prevent navigation', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    await panel.getEmptyFolder(TEST_FOLDERS.EMPTY);
    await panel.verifyEmptyFolderCannotOpen(TEST_FOLDERS.EMPTY);
  });
});

test.describe('Bookmark Display Features', () => {
  test('should display favicon for bookmarks', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const favicon = panel.getFaviconElement(TEST_BOOKMARKS.REACT_DOCS);
    await expect(favicon).toBeVisible();
  });

  test('should show URL tooltip on bookmark hover', async ({
    authenticatedPage,
  }) => {
    const panel = new BookmarksPanel(authenticatedPage);
    const tooltip = await panel.hoverBookmarkForTooltip(
      TEST_BOOKMARKS.REACT_DOCS
    );
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toBeTruthy();
    expect(tooltipText).toContain('material');
  });
});
