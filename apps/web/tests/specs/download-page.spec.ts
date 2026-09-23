import { GITHUB_REPO_URL } from '@bypass/shared';
import { openNewPageFromAction } from '@bypass/shared/tests';
import { type Page } from '@playwright/test';

import { expect, test } from '../fixtures/base-fixture';

const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));

/** Retried: a click that lands before hydration is a no-op leaving no trace. */
const setTheme = async (page: Page, dark: boolean) => {
  const toggle = page.getByRole('button', { name: 'Toggle theme' });
  await expect(async () => {
    if ((await isDark(page)) !== dark) {
      await toggle.click();
    }
    expect(await isDark(page)).toBe(dark);
  }).toPass();
};

const isImageLoaded = (page: Page, alt: string) =>
  page
    .getByAltText(alt)
    .filter({ visible: true })
    .evaluate((image: HTMLImageElement) => image.naturalWidth > 0);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Download page', () => {
  test('page metadata', async ({ page }) => {
    await expect(page).toHaveTitle('Bypass Links');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'straight to the link you actually wanted',
      })
    ).toBeVisible();
  });

  test('chrome extension download', async ({ page }, testConfig) => {
    testConfig.setTimeout(30 * 1000);
    const downloadPromise = page.waitForEvent('download');
    // Scoped to the hero: the free section and closing band repeat the same link
    const heroSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { level: 1 }) });
    await heroSection
      .getByRole('link', { name: 'Download for Chrome' })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^chrome-bypass-links-.+.zip$/
    );
  });

  test('footer elements should exist', async ({ page }) => {
    await expect(page.getByTestId('ext-version')).toBeVisible();
    // Date renders only in the browser, so this also asserts the use(browser()) swap
    await expect(page.getByTestId('ext-release-date')).toHaveText(
      /\d{2} \w+ \d{4} at \d{2}:\d{2} [ap]m/
    );
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
    // Exact href: a prefix match would also catch the release download links
    const repoLinks = page.locator(`a[href="${GITHUB_REPO_URL}"]`);

    await expect(repoLinks).not.toHaveCount(0);
    for (const link of await repoLinks.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      // `noreferrer` alone already severs `window.opener` in Chrome
      await expect(link).toHaveAttribute('rel', /noreferrer/);

      const newPage = await openNewPageFromAction(context, async () => {
        await link.click();
      });

      await expect.poll(() => newPage.url()).toBe(GITHUB_REPO_URL);
      // The property, not the window: a live `Window` does not serialise back
      expect(await newPage.evaluate(() => window.opener === null)).toBe(true);
      await newPage.close();
    }
  });

  test('theme toggle flips the page and is remembered', async ({ page }) => {
    const flipped = !(await isDark(page));

    await setTheme(page, flipped);

    await page.reload();
    await expect.poll(() => isDark(page)).toBe(flipped);
  });

  test('panels stay dark whatever the landing theme is', async ({ page }) => {
    await setTheme(page, false);

    await page.goto('/web-ext');
    await expect(page.getByTestId('header-badge')).toBeVisible();
    expect(await isDark(page)).toBe(true);
  });

  test('panels stay dark after a client-side hop from the light landing', async ({
    page,
  }) => {
    await setTheme(page, false);

    await page
      .getByRole('button', { name: 'Bypass Links' })
      .click({ clickCount: 5 });
    await page.waitForURL('/web-ext');
    await expect(page.getByTestId('header-badge')).toBeVisible();
    expect(await isDark(page)).toBe(true);
  });

  test('faq rows open by click and by keyboard', async ({ page }) => {
    const answer = page.getByText('yes, and it always will be');
    await expect(answer).toBeHidden();

    const question = page.getByText('is it free?');
    await question.click();
    await expect(answer).toBeVisible();

    await question.press('Enter');
    await expect(answer).toBeHidden();

    await question.press('Enter');
    await expect(answer).toBeVisible();
  });

  test('header anchors bring their section into view', async ({ page }) => {
    const features = page.getByRole('heading', {
      name: 'what you get out of the box',
    });
    const faq = page.getByRole('heading', { name: 'questions, answered' });
    await expect(features).not.toBeInViewport();

    await page.getByRole('link', { name: 'Features' }).click();
    await expect(features).toBeInViewport();

    await page.getByRole('link', { name: 'FAQ' }).click();
    await expect(faq).toBeInViewport();
  });

  test('free section renders its heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'every feature included, nothing to pay for.',
      })
    ).toBeVisible();
  });

  test('product shots are rendered', async ({ page }) => {
    for (const alt of ['The Bypass Links popup', 'The Bookmarks Panel']) {
      await expect(
        page.getByAltText(alt).filter({ visible: true })
      ).toBeVisible();
      await expect.poll(() => isImageLoaded(page, alt)).toBe(true);
    }
  });

  test('mobile popup fits in both landing themes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const dark of [false, true]) {
      await setTheme(page, dark);
      await expect(
        page.getByRole('button', { name: 'Bypass Links' })
      ).toBeVisible();
      await expect(
        page.getByAltText('The Bypass Links popup').filter({ visible: true })
      ).toBeVisible();
      await expect(page.getByText('Bookmarks', { exact: true })).toBeHidden();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBe(390);
    }
  });
});
