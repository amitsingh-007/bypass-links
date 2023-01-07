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

  test('offline mode', async ({ page }, testConfig) => {
    testConfig.setTimeout(30 * 1000);
    await page.waitForTimeout(15 * 1000); //Let the SW cache assets
    const context = page.context();
    await context.setOffline(true);
    await page.reload();
    const downloadPage = new DownloadPage(page);
    await downloadPage.testPageMetaData();
  });
});
