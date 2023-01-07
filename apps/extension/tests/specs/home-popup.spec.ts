import { test, chromium } from '@playwright/test';
import path from 'path';

test.describe('Home Popup', () => {
  test('load extension', async () => {
    const pathToExtension = path.join(__dirname, '../../build');
    console.log(pathToExtension);
    const userDataDir = '/tmp/test-user-data-dir';
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    const page = await browserContext.newPage();
    await page.goto('/index.html');
    await page.isVisible('Bypass Links');
  });
});
