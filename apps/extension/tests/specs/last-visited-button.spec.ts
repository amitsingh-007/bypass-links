import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';

test.describe('LastVisitedButton', () => {
  test('should update timestamp and show tooltip after clicking Visited button', async ({
    homePage,
  }) => {
    const logoutButton = homePage.getByRole('button', { name: 'Logout' });
    await homeExpect(logoutButton).toBeVisible();

    const lastVisitedButton = homePage.getByTestId('last-visited-button');
    await homeExpect(lastVisitedButton).toBeVisible();
    await homeExpect(lastVisitedButton).toBeEnabled();

    await lastVisitedButton.click();

    // Move away then hover to trigger tooltip fresh
    await homePage.mouse.move(0, 0);
    await lastVisitedButton.hover();

    const tooltip = homePage
      .locator('[data-slot="tooltip-content"]')
      .filter({ hasText: /,/ });
    await homeExpect(tooltip).toBeVisible();
    const initialTooltipText = await tooltip.textContent();
    homeExpect(initialTooltipText).not.toBeNull();
    if (!initialTooltipText) {
      throw new Error('Expected last visited tooltip text to be present');
    }

    await homePage.mouse.move(0, 0);

    // Wait until the next second tick to ensure timestamp precision changes.
    const firstClickTime = Date.now();
    await homeExpect
      .poll(() => Date.now())
      .toBeGreaterThanOrEqual(firstClickTime + 1000);

    await lastVisitedButton.click();

    // Move away then hover to trigger tooltip fresh
    await homePage.mouse.move(0, 0);
    await homeExpect(tooltip).toBeHidden();
    await lastVisitedButton.hover();

    await homeExpect(tooltip).toBeVisible();
    await homeExpect(tooltip).not.toHaveText(initialTooltipText);
  });
});
