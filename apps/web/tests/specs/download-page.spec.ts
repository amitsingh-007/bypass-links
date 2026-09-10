import { GITHUB_REPO_URL } from '@bypass/shared';
import { openNewPageFromAction } from '@bypass/shared/tests';

import { expect, test } from '../fixtures/base-fixture';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Download page', () => {
  test('page metadata', async ({ page }) => {
    await expect(page).toHaveTitle('Bypass Links');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Skip the Wait. Bypass Links Instantly.'
    );
  });

  test('chrome extension download', async ({ page }, testConfig) => {
    testConfig.setTimeout(30 * 1000);
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('a', {
      hasText: 'Download for Chrome',
    });
    await downloadButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^chrome-bypass-links-.+.zip$/
    );
  });

  test('footer elements should exist', async ({ page }) => {
    await expect(page.getByTestId('ext-version')).toBeVisible();
    await expect(page.getByTestId('ext-release-date')).toBeVisible();
    await expect(page.getByTitle('Bypass Links - Github')).toHaveAttribute(
      'href',
      'https://github.com/amitsingh-007/bypass-links'
    );
  });

  test('repository links open a new tab that cannot reach back', async ({
    page,
    context,
  }) => {
    // Stubbed so the assertions read the opened tab, not github's redirects
    await context.route(`${GITHUB_REPO_URL}**`, (route) =>
      route.fulfill({ contentType: 'text/html', body: '' })
    );
    const repoLinks = page.locator(`a[href="${GITHUB_REPO_URL}"]`);

    await expect(repoLinks).toHaveCount(2);
    for (const link of await repoLinks.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      // `noreferrer` alone already severs `window.opener` in Chrome
      await expect(link).toHaveAttribute('rel', /noreferrer/);
    }

    // Both links, since only the header one carries an explicit `noopener`
    for (const link of [
      page.locator(`header a[href="${GITHUB_REPO_URL}"]`),
      page.getByTitle('Bypass Links - Github'),
    ]) {
      const newPage = await openNewPageFromAction(context, async () => {
        await link.click();
      });

      await expect.poll(() => newPage.url()).toBe(GITHUB_REPO_URL);
      // The property, not the window: a live `Window` does not serialise back
      expect(await newPage.evaluate(() => window.opener === null)).toBe(true);
      await newPage.close();
    }
  });
});
