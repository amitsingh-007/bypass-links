import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';

/**
 * LastVisitedButton E2E Tests
 *
 * Tests the LastVisitedButton component which tracks when a user last visited
 * a website/domain. These tests run sequentially with shared browser context.
 */

test.describe('LastVisitedButton', () => {
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

    // Move away then hover to trigger tooltip fresh
    await homePage.mouse.move(0, 0);
    await lastVisitedButton.hover();

    // Get the tooltip element and capture its text
    const tooltip = homePage
      .locator('[data-slot="tooltip-content"]')
      .filter({ hasText: /,/ });
    await homeExpect(tooltip).toBeVisible();
    const initialTooltipText = await tooltip.textContent();
    homeExpect(initialTooltipText).not.toBeNull();
    if (!initialTooltipText) {
      throw new Error('Expected last visited tooltip text to be present');
    }

    // Move away from tooltip
    await homePage.mouse.move(0, 0);

    // Wait until the next second tick to ensure timestamp precision changes.
    const firstClickTime = Date.now();
    await homeExpect
      .poll(() => Date.now())
      .toBeGreaterThanOrEqual(firstClickTime + 1000);

    // Click again to update timestamp
    await lastVisitedButton.click();

    // Move away then hover to trigger tooltip fresh
    await homePage.mouse.move(0, 0);
    await homeExpect(tooltip).toBeHidden();
    await lastVisitedButton.hover();

    // Wait for tooltip text to change from initial value (auto-retrying)
    await homeExpect(tooltip).toBeVisible();
    await homeExpect(tooltip).not.toHaveText(initialTooltipText);
  });
});
