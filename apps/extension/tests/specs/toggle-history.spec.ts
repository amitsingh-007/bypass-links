import {
  TEST_SITES,
  TEST_BOOKMARKS,
  openNewPageFromAction,
} from '@bypass/shared/tests';

import { test, expect } from '../fixtures/home-popup-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { getHistoryItems } from '../utils/history-utils';
import { PopupHomePanel } from '../utils/home-panel';

/**
 * ToggleHistory E2E Tests
 *
 * Tests the ToggleHistory component which enables/disables browser history tracking.
 * When turned off, it deletes the tracked history range from Chrome's history.
 */

test.describe('History Tracking Workflow', () => {
  test.describe.configure({ mode: 'parallel' });
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

    // Verify historyStartTime is set in browser.storage.local
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

    await test.step('enable tracking', async () => {
      await homePanel.setHistoryEnabled(true);
      await expect(homePanel.historyToggle).toBeChecked();
    });

    await test.step('visits land in history', async () => {
      for (const site of sites) {
        const newPage = await context.newPage();
        await newPage.goto(site, { waitUntil: 'domcontentloaded' });
        await newPage.close();
      }

      expect(await getHistoryItems(homePage, sites)).not.toHaveLength(0);
    });

    await test.step('disable tracking', async () => {
      await homePanel.setHistoryEnabled(false);
      await expect(homePanel.historyToggle).not.toBeChecked();
      await homePanel.verifyHistoryStartTimeNotExists();
    });

    await test.step('tracked history is deleted', async () => {
      await expect
        .poll(
          async () => {
            const historyAfter = await getHistoryItems(homePage, sites);
            return historyAfter.length;
          },
          {
            message: 'History items should be deleted',
            timeout: 15_000,
          }
        )
        .toBe(0);
    });
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

    const newPage = await openNewPageFromAction(context, async () => {
      await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
    });
    await newPage.close();

    // Navigate back to Home page to verify the toggle
    await panel.navigateBack();

    // Verify history tracking is now ON
    await expect(homePanel.historyToggle).toBeChecked();

    // Verify historyStartTime is set in storage
    await homePanel.verifyHistoryStartTime();
  });
});
