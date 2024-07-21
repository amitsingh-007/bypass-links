import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Web Ext page', () => {
  test('opens web-ext page by clicking header', async ({ page }) => {
    const appIcon = page.getByAltText('app-icon');
    await appIcon.click({ clickCount: 5 });
    await page.waitForURL('/web-ext');
    await expect(page.getByText('Bypass Links - Web')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Bypass Links - Web')).toBeVisible();
  });
});
