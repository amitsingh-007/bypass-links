import {
  TEST_TIMEOUTS,
  TEST_SITES,
  TEST_BOOKMARKS,
} from '@bypass/shared/tests';
import { test, expect } from '../fixtures/home-popup-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PopupHomePanel } from '../utils/home-panel';
import { getHistoryItems } from './toggle-history.spec.utils';

/**
 * ToggleHistory E2E Tests
 *
 * Tests the ToggleHistory component which enables/disables browser history tracking.
 * When turned off, it deletes the tracked history range from Chrome's history.
 */

test.describe.serial('History Tracking Workflow', () => {
  test('should turn on history tracking', async ({ homePage }) => {
    const homePanel = new PopupHomePanel(homePage);

    // Ensure history tracking starts in OFF state
    await homePanel.setHistoryEnabled(false);

    // Verify initial state is off
    await expect(homePanel.historyToggle).not.toBeChecked();

    // Turn on history tracking
    await homePanel.setHistoryEnabled(true);

    // Verify switch is now checked
    await expect(homePanel.historyToggle).toBeChecked();

    // Verify historyStartTime is set in chrome.storage.local
    await homePanel.verifyHistoryStartTime();
  });

  test('should visit test sites and delete tracked history when turned off', async ({
    homePage,
    context,
  }) => {
    const homePanel = new PopupHomePanel(homePage);
    const sites = [
      TEST_SITES.EXAMPLE_COM,
      TEST_SITES.EXAMPLE_ORG,
      TEST_SITES.EXAMPLE_NET,
    ];

    // Visit each site in a new tab
    for (const site of sites) {
      const newPage = await context.newPage();
      await newPage.goto(site);
      await newPage.waitForLoadState('networkidle');
      await newPage.close();
    }

    // Verify the sites are in browser history
    const historyBefore = await getHistoryItems(homePage, sites);
    expect(historyBefore.length).toBeGreaterThan(0);

    // Turn off history tracking
    await homePanel.setHistoryEnabled(false);
    await homePage.waitForTimeout(TEST_TIMEOUTS.LONG_WAIT);

    // Verify switch is now unchecked
    await expect(homePanel.historyToggle).not.toBeChecked();

    // Verify historyStartTime is removed from storage
    await homePanel.verifyHistoryStartTimeNotExists();

    // Verify the test sites are deleted from browser history
    const historyAfter = await getHistoryItems(homePage, sites);
    expect(historyAfter).toHaveLength(0);
  });

  test('should turn on history tracking when a bookmark is opened', async ({
    homePage,
    context,
  }) => {
    const homePanel = new PopupHomePanel(homePage);

    // Ensure history tracking starts in OFF state
    await homePanel.setHistoryEnabled(false);
    await expect(homePanel.historyToggle).not.toBeChecked();

    // Navigate to Bookmarks Panel
    await homePanel.navigateToBookmarks();

    const panel = new BookmarksPanel(homePage);

    // Double-click to open bookmark and wait for new tab
    const bookmarkRow = panel.getBookmarkElement(TEST_BOOKMARKS.REACT_DOCS);
    await expect(bookmarkRow).toBeVisible();

    const pagePromise = context.waitForEvent('page', {
      timeout: TEST_TIMEOUTS.PAGE_OPEN,
    });
    await bookmarkRow.dblclick();
    const newPage = await pagePromise;
    expect(newPage).toBeTruthy();
    await newPage.close();

    // Navigate back to Home page to verify the toggle
    await panel.navigateBack();
    await homePage.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

    // Verify history tracking is now ON
    await expect(homePanel.historyToggle).toBeChecked();

    // Verify historyStartTime is set in storage
    await homePanel.verifyHistoryStartTime();
  });
});
