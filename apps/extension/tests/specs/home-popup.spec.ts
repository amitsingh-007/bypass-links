import { expect, test } from '../fixtures/extension-fixture';

test.describe('Home Popup', () => {
  test('load extension', async ({ page, backgroundSW }) => {
    await page.goto('/index.html');
    //Content script loaded
    await page.isVisible('Bypass Links');
    const isSWIntialized = await backgroundSW.evaluate(
      () => self.__SW_INITIALIZED__
    );
    //Background SW loaded
    expect(isSWIntialized).toBeTruthy();
  });
});
