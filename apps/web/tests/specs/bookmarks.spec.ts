import {
  TEST_BOOKMARKS,
  TEST_BOOKMARK_URLS,
  TEST_FOLDERS,
  TEST_FOLDER_BOOKMARKS,
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
    expect(await panel.getBookmarkTitles()).toEqual(TEST_FOLDER_BOOKMARKS.ROOT);

    await panel.openFolder(TEST_FOLDERS.MAIN, TEST_FOLDER_BOOKMARKS.MAIN);

    await panel.navigateBack();
    await panel.verifyFolderExists(TEST_FOLDERS.MAIN);
    await expect
      .poll(() => panel.getBookmarkTitles())
      .toEqual(TEST_FOLDER_BOOKMARKS.ROOT);
  });

  test('should search bookmarks by title and URL', async ({ page }) => {
    const panel = new BookmarksPanel(page);

    await test.step('search by title', async () => {
      await fillSearchInput(page, 'ButtonGroup');
      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual([TEST_BOOKMARKS.GITHUB]);
      await clearSearchInput(page);
    });

    await test.step('search by url', async () => {
      await fillSearchInput(page, 'bottom-navigation');
      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual([TEST_BOOKMARKS.REACT_DOCS]);
    });

    await test.step('clearing restores the full listing', async () => {
      await clearSearchInput(page);
      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual(TEST_FOLDER_BOOKMARKS.ROOT);
    });
  });

  test('should keep folders visible when searching and filter results', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);
    const foldersBefore = await panel.getFolderNames();

    await fillSearchInput(page, 'nonexistent');
    expect(await panel.getFolderNames()).toEqual(foldersBefore);
    await expect.poll(() => panel.getBookmarkTitles()).toEqual([]);

    await clearSearchInput(page);
    await fillSearchInput(page, 'ButtonGroup');
    await expect
      .poll(() => panel.getBookmarkTitles())
      .toEqual([TEST_BOOKMARKS.GITHUB]);

    await clearSearchInput(page);
  });

  test('should open bookmark by double-clicking', async ({ page, context }) => {
    const panel = new BookmarksPanel(page);
    // material-ui.com 301s to mui.com, so an unstubbed tab races its own redirect
    await context.route(`${TEST_BOOKMARK_URLS.REACT_DOCS}**`, (route) =>
      route.fulfill({ contentType: 'text/html', body: '' })
    );

    const newPage = await openNewPageFromAction(context, async () => {
      await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
    });

    await expect.poll(() => newPage.url()).toBe(TEST_BOOKMARK_URLS.REACT_DOCS);
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
    // Rows, not bookmarks: the badge counts the subfolders it lists too
    const countRows = async () =>
      (await panel.getFolderNames()).length +
      (await panel.getBookmarkTitles()).length;

    await expect(panel.getBookmarkCountBadge()).toBeVisible();
    expect(await panel.getBadgeCount()).toBe(await countRows());

    await panel.openFolder(TEST_FOLDERS.MAIN, TEST_FOLDER_BOOKMARKS.MAIN);

    await expect(panel.getBookmarkCountBadge()).toContainText(
      TEST_FOLDERS.MAIN
    );
    expect(await panel.getBadgeCount()).toBe(TEST_FOLDER_BOOKMARKS.MAIN.length);
  });

  test('should show not-allowed cursor on empty folder and prevent navigation', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);
    await panel.verifyEmptyFolderCannotOpen(
      TEST_FOLDERS.EMPTY,
      TEST_FOLDER_BOOKMARKS.ROOT
    );
  });

  test('should open a folder deep link directly and keep it across a reload', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);
    const folderId = await panel.getFolderId(TEST_FOLDERS.MAIN);

    await page.goto(`/bookmark-panel?folderId=${folderId}`);

    const expectMainFolder = async () => {
      await expect(panel.getBookmarkCountBadge()).toContainText(
        TEST_FOLDERS.MAIN
      );
      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual(TEST_FOLDER_BOOKMARKS.MAIN);
    };
    await expectMainFolder();

    await page.reload();

    await expectMainFolder();
  });

  test('should show a usable empty panel for an unknown folder id', async ({
    page,
  }) => {
    const panel = new BookmarksPanel(page);

    await page.goto('/bookmark-panel?folderId=e2e-unknown-folder');

    await expect(panel.getBookmarkCountBadge()).toHaveText('Not Found (0)');
    await expect(panel.getBookmarkItems()).toHaveCount(0);
    await expect(panel.getFolderElement(TEST_FOLDERS.MAIN)).toHaveCount(0);

    await test.step('the search box still accepts input', async () => {
      await fillSearchInput(page, 'ButtonGroup');
      await expect(panel.getBookmarkItems()).toHaveCount(0);
      await clearSearchInput(page);
    });

    await test.step('Back leaves for a folder that does exist', async () => {
      await panel.navigateBack();

      await expect
        .poll(() => panel.getBookmarkTitles())
        .toEqual(TEST_FOLDER_BOOKMARKS.ROOT);
    });
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
