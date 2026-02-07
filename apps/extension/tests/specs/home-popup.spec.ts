import { expect, test } from '../fixtures/extension-fixture';

test.describe('Home Popup', () => {
  test('load extension', async ({ page, backgroundSW }) => {
    await page.goto('/popup.html');
    // Content script loaded
    await expect(page.getByTestId('home-popup-heading')).toBeVisible();
    const isSWInitialized = await backgroundSW.evaluate(
      () => self.SW_INITIALIZED
    );
    // Background SW loaded
    expect(isSWInitialized).toBeTruthy();
  });
});
