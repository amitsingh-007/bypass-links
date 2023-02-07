import { expect, test } from '../fixtures/extension-fixture';

test.describe('Home Popup', () => {
  test('load extension', async ({ page, backgroundSW }) => {
    await page.goto('/index.html');
    // Content script loaded
    await page.isVisible('Bypass Links');
    const isSWInitialized = await backgroundSW.evaluate(
      // eslint-disable-next-line no-restricted-globals
      () => self.SW_INITIALIZED
    );
    // Background SW loaded
    expect(isSWInitialized).toBeTruthy();
  });
});
