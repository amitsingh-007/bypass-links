import { expect, test } from '@playwright/test';
import { DownloadPage } from '../page-object-models/download-page';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Download page', () => {
  test('page metadata', async ({ page }) => {
    const downloadPage = new DownloadPage(page);
    await downloadPage.testPageMetaData();
  });

  test('extension download', async ({ page }, testConfig) => {
    testConfig.setTimeout(30 * 1000);
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('a', { hasText: 'Download Now' });
    await downloadButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/bypass-links-.+.zip/);
  });

  test('footer elements should exist', async ({ page }) => {
    expect(page.getByTestId('ext-version')).toBeVisible();
    expect(page.getByTestId('ext-release-data')).toBeVisible();
    expect(
      await page.getByTitle('Bypass Links - Github').getAttribute('href')
    ).toEqual('https://github.com/amitsingh-007/bypass-links');
  });
});
