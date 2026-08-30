import { sha256Hash } from '@bypass/shared';

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

    await homePage.clock.install({ time: Date.now() });
    try {
      const currentUrl = await homePage.evaluate(async () => {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        return tab.url ?? '';
      });
      const hash = URL.canParse(currentUrl)
        ? await sha256Hash(new URL(currentUrl).hostname)
        : '';
      let timestamp = await homePage.evaluate(() => Date.now());

      await homePage.route(
        '**/api/trpc/firebaseData.upsertLastVisited*',
        async (route) => {
          await route.fulfill({
            json: [{ result: { data: { hash, timestamp } } }],
          });
        }
      );

      await lastVisitedButton.click();

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
      await homePage.clock.fastForward(1000);
      timestamp = await homePage.evaluate(() => Date.now());

      await lastVisitedButton.click();

      await homePage.mouse.move(0, 0);
      await homeExpect(tooltip).toBeHidden();
      await lastVisitedButton.hover();

      await homeExpect(tooltip).toBeVisible();
      await homeExpect(tooltip).not.toHaveText(initialTooltipText);
    } finally {
      await homePage.clock.resume();
    }
  });
});
