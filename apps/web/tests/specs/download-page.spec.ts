import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Download page', () => {
  test('page metadata', async ({ page }) => {
    await expect(page).toHaveTitle(
      'Bypass Links - Skip Links, Ads, Timers & Recaptchas'
    );
    expect(await page.getByRole('heading', { level: 1 }).innerText()).toBe(
      'Have a Link Bypasser and private Bookmarks Panel !'
    );
  });

  test('extension download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('a', { hasText: 'Download Now' });
    await downloadButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/bypass-links-.+.zip/);
  });
});
