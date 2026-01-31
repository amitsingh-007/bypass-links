import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';

/**
 * LastVisitedButton E2E Tests
 *
 * Tests the LastVisitedButton component which tracks when a user last visited
 * a website/domain. These tests run sequentially with shared browser context.
 */

test.describe.serial('LastVisitedButton', () => {
  test('should update timestamp and show tooltip after clicking Visited button', async ({
    homePage,
  }) => {
    // Verify logged in state
    const logoutButton = homePage.getByRole('button', { name: 'Logout' });
    await homeExpect(logoutButton).toBeVisible();

    // Get the LastVisited button
    const lastVisitedButton = homePage.getByTestId('last-visited-button');
    await homeExpect(lastVisitedButton).toBeVisible();
    await homeExpect(lastVisitedButton).toBeEnabled();

    // Click to set initial timestamp
    await lastVisitedButton.click();
    await homePage.waitForTimeout(TEST_TIMEOUTS.NAVIGATION);

    // Hover to capture initial timestamp from tooltip
    await lastVisitedButton.hover();
    await homePage.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

    // Get the tooltip element and capture its text
    const tooltip = homePage
      .locator('.mantine-Tooltip-tooltip')
      .filter({ hasText: /,/ });
    const initialTooltipText = await tooltip.textContent();
    homeExpect(initialTooltipText).toBeTruthy();

    // Move away from tooltip
    await homePage.mouse.move(0, 0);

    // Click again to update timestamp
    await lastVisitedButton.click();
    await homePage.waitForTimeout(TEST_TIMEOUTS.NAVIGATION);

    // Hover to get updated timestamp
    await lastVisitedButton.hover();
    await homePage.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

    // Poll until the tooltip text changes from initial (with 5 second timeout)
    await homeExpect
      .poll(
        async () => {
          const updatedTooltipText = await tooltip.textContent();
          // First assert tooltip is not null (visible), then compare
          if (updatedTooltipText === null) {
            return false;
          }
          return updatedTooltipText !== initialTooltipText;
        },
        {
          timeout: 5000,
          message: 'Tooltip timestamp should change from initial value',
        }
      )
      .toBe(true);
  });
});
