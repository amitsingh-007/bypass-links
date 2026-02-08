import { expect, test } from '../fixtures/extension-fixture';

test.describe('Home Popup', () => {
  test('load extension', async ({ page }) => {
    await page.goto('/popup.html');
    // Content script loaded
    await expect(page.getByTestId('home-popup-heading')).toBeVisible();
  });
});
