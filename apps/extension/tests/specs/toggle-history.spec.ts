import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';
import { TEST_SITES } from '../constants';
import { getStorageItem } from '../utils/test-utils';
import { getHistoryItems } from './toggle-history.spec.utils';

/**
 * ToggleHistory E2E Tests
 *
 * Tests the ToggleHistory component which enables/disables browser history tracking.
 * When turned off, it deletes the tracked history range from Chrome's history.
 */

test.describe.serial('History Tracking Workflow', () => {
  test('should turn on history tracking', async ({ homePage }) => {
    const toggleSwitch = homePage.getByTestId('toggle-history-switch');
    // Mantine Switch input is hidden, need to click the label
    const toggleLabel = homePage
      .locator('label')
      .filter({ hasText: 'History' });

    // Ensure history tracking starts in OFF state
    const isChecked = await toggleSwitch.isChecked();
    if (isChecked) {
      await toggleLabel.click();
    }

    // Verify initial state is off
    await homeExpect(toggleSwitch).not.toBeChecked();

    // Turn on history tracking by clicking the label
    await toggleLabel.click();

    // Verify switch is now checked
    await homeExpect(toggleSwitch).toBeChecked();

    // Verify historyStartTime is set in chrome.storage.local
    const historyStartTime = await getStorageItem<string>(
      homePage,
      'historyStartTime'
    );
    homeExpect(historyStartTime).toBeDefined();
  });

  test('should visit test sites and delete tracked history when turned off', async ({
    homePage,
    context,
  }) => {
    const toggleSwitch = homePage.getByTestId('toggle-history-switch');
    const toggleLabel = homePage
      .locator('label')
      .filter({ hasText: 'History' });
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
    homeExpect(historyBefore.length).toBeGreaterThan(0);

    // Turn off history tracking by clicking the label
    await toggleLabel.click();

    // Verify switch is now unchecked
    await homeExpect(toggleSwitch).not.toBeChecked();

    // Verify historyStartTime is removed from storage
    const historyStartTime = await getStorageItem<string>(
      homePage,
      'historyStartTime'
    );
    homeExpect(historyStartTime).toBeUndefined();

    // Verify the test sites are deleted from browser history
    const historyAfter = await getHistoryItems(homePage, sites);
    homeExpect(historyAfter).toHaveLength(0);
  });

  test('should verify history toggle is turned on when opening bookmarks', async ({
    homePage,
  }) => {
    const toggleLabel = homePage
      .locator('label')
      .filter({ hasText: 'History' });
    await homeExpect(toggleLabel).toBeVisible();

    const toggleSwitch = homePage.getByTestId('toggle-history-switch');

    // Previous test sets the toggle to OFF state, so we expect it to be unchecked
    await homeExpect(toggleSwitch).not.toBeChecked();

    // Turn it ON by clicking the label
    await toggleLabel.click();

    // Verify switch is now checked
    await homeExpect(toggleSwitch).toBeChecked();
  });
});
