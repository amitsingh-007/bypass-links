import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { type Page, type Worker } from '@playwright/test';

import { test, expect } from '../fixtures/auth-fixture';
import { getPopupUrl } from '../fixtures/base-fixture';

/** Returns a reader for how many times the version check has been made. */
const mockLatestVersion = async (page: Page, version: string) => {
  let requestCount = 0;

  await page.route('**/api/trpc/extension.latest*', (route) => {
    requestCount += 1;
    return route.fulfill({
      json: [
        {
          result: {
            data: {
              chrome: {
                version,
                downloadLink: 'https://example.com/chrome-bypass-links.zip',
                date: '2026-08-09T13:46:30Z',
              },
            },
          },
        },
      ],
    });
  });

  return () => requestCount;
};

const getBadgeText = (backgroundSW: Worker) =>
  backgroundSW.evaluate(() => chrome.action.getBadgeText({}));

/**
 * StrictMode double-invokes effects in the dev build, so a late request from
 * the previous open would otherwise be miscounted as the next open's.
 */
const waitForSettledRequests = async (getRequestCount: () => number) => {
  let previous = -1;
  await expect
    .poll(() => {
      const current = getRequestCount();
      const isSettled = current > 0 && current === previous;
      previous = current;
      return isSettled;
    })
    .toBe(true);

  return previous;
};

const openPopup = async (page: Page, extensionId: string) => {
  await page.goto(getPopupUrl(extensionId), { waitUntil: 'domcontentloaded' });
  await page
    .getByTestId('logout-button')
    .waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.AUTH });
};

test.describe('Outdated extension badge', () => {
  test('marks the toolbar when a newer version has been released', async ({
    page,
    extensionId,
    backgroundSW,
    login: _login,
  }) => {
    await mockLatestVersion(page, '99.0.0');
    await openPopup(page, extensionId);

    await expect.poll(() => getBadgeText(backgroundSW)).toBe('!');
    await expect
      .poll(() => backgroundSW.evaluate(() => chrome.action.getTitle({})))
      .toContain('older version');
  });

  test('leaves the toolbar unmarked when the running version is ahead of the release', async ({
    page,
    extensionId,
    backgroundSW,
    login: _login,
  }) => {
    await mockLatestVersion(page, '0.1.0');
    await openPopup(page, extensionId);

    await expect.poll(() => getBadgeText(backgroundSW)).toBe('');
  });

  test('clears a stale badge once the running version is the latest', async ({
    page,
    extensionId,
    backgroundSW,
    login: _login,
  }) => {
    const currentVersion = await backgroundSW.evaluate(
      () => chrome.runtime.getManifest().version
    );
    await backgroundSW.evaluate(() =>
      chrome.action.setBadgeText({ text: '!' })
    );

    await mockLatestVersion(page, currentVersion);
    await openPopup(page, extensionId);

    await expect.poll(() => getBadgeText(backgroundSW)).toBe('');
  });

  test('re-checks on every popup open', async ({
    page,
    extensionId,
    login: _login,
  }) => {
    const getRequestCount = await mockLatestVersion(page, '99.0.0');

    await openPopup(page, extensionId);
    const afterFirstOpen = await waitForSettledRequests(getRequestCount);

    await openPopup(page, extensionId);
    await expect.poll(getRequestCount).toBeGreaterThan(afterFirstOpen);
  });
});
