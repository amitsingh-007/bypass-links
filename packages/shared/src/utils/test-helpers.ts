import fs from 'node:fs';

import {
  expect,
  test,
  type BrowserContext,
  type ConsoleMessage,
  type Locator,
  type Page,
  type WebError,
} from '@playwright/test';

import { TEST_LARGE_LIST, TEST_TIMEOUTS } from '../constants/e2e-tests';

type TestIdScope = Pick<Page, 'getByTestId'>;

export const dumpLocalStorage = async (
  page: Page
): Promise<Record<string, string>> =>
  Object.fromEntries(
    (await page.localStorage.items()).map(({ name, value }) => [name, value])
  );

export const injectLocalStorage = async (
  context: BrowserContext,
  data: Record<string, string>
) => {
  await context.addInitScript((storageJson) => {
    const entries = JSON.parse(storageJson) as Record<string, string>;
    for (const [key, value] of Object.entries(entries)) {
      window.localStorage.setItem(key, value);
    }
  }, JSON.stringify(data));
};

export const closeDialog = async (
  page: Page,
  dialog?: ReturnType<Page['getByRole']>
) => {
  const targetDialog = dialog ?? page.getByRole('dialog');
  const closeButton = targetDialog.locator('[data-slot="dialog-close"]');

  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click();
  } else {
    await page.keyboard.press('Escape');
  }

  await expect(targetDialog).toBeHidden();
};

type SearchScope = Pick<Page, 'getByPlaceholder'>;

export const fillSearchInput = async (
  scope: SearchScope,
  query: string,
  placeholder = 'Search'
) => {
  const searchInput = scope.getByPlaceholder(placeholder);
  await searchInput.fill(query);
  await expect(searchInput).toHaveValue(query);
};

export const clearSearchInput = async (scope: SearchScope) => {
  const searchInput = scope.getByPlaceholder('Search');
  await searchInput.clear();
  await expect(searchInput).toHaveValue('');
};

/** Prefers a parenthesised count, since names in the badge may contain digits. */
export const parseBadgeCount = (badgeText: string): number =>
  Number(/\((\d+)\)/.exec(badgeText)?.[1] ?? /\d+/.exec(badgeText)?.[0] ?? 0);

export const getNumericBadgeValue = async (
  scope: TestIdScope,
  testId: string
): Promise<number> => {
  const badge = scope.getByTestId(testId);
  await expect(badge).toBeVisible();
  return parseBadgeCount((await badge.textContent()) ?? '');
};

export const clickDropdownPersonAndGetName = async (
  dropdown: Locator
): Promise<string> => {
  const dropdownAvatar = dropdown.locator('[data-testid^="dropdown-avatar-"]');
  await expect(dropdownAvatar).toBeVisible();
  await expect(dropdownAvatar).toBeEnabled();

  const testId = (await dropdownAvatar.getAttribute('data-testid')) ?? '';
  const personName = testId.replace('dropdown-avatar-', '');

  if (!personName) {
    throw new Error('Expected dropdown avatar test id to include person name');
  }

  await dropdownAvatar.click();
  return personName;
};

/** Retries the action, so every caller's action must be idempotent: a swallowed gesture leaves no trace but the tab never arriving. */
export const openNewPageFromAction = async (
  context: BrowserContext,
  action: () => Promise<void>
): Promise<Page> => {
  const openedPages: Page[] = [];
  const collectPage = (page: Page) => openedPages.push(page);
  context.on('page', collectPage);
  // Without the page's own logs, a flake here is indistinguishable from a gesture that never landed
  const pageLogs: string[] = [];
  const collectConsole = (message: ConsoleMessage) => {
    if (message.type() === 'error') {
      pageLogs.push(`console.error: ${message.text()}`);
    }
  };
  const collectError = (error: WebError) =>
    pageLogs.push(`pageerror: ${error.error().message}`);
  context.on('console', collectConsole);
  context.on('weberror', collectError);
  let handedOver: Page | undefined;

  try {
    try {
      await expect(async () => {
        await action();
        await expect
          .poll(() => openedPages.length, {
            timeout: TEST_TIMEOUTS.PAGE_OPEN_ATTEMPT,
            message: 'Expected action to open a new page',
          })
          .toBeGreaterThan(0);
      }).toPass({ timeout: TEST_TIMEOUTS.LONG_WAIT, intervals: [100] });
    } catch (error) {
      // Appended here, not in the poll message, which is templated before the poll runs
      if (pageLogs.length) {
        throw new Error(
          `${(error as Error).message}\n\nPage logs:\n${pageLogs.join('\n')}`,
          { cause: error }
        );
      }
      throw error;
    }

    const [newPage] = openedPages;
    await expect
      .poll(() => newPage.url(), { timeout: TEST_TIMEOUTS.LONG_WAIT })
      .not.toBe('about:blank');
    handedOver = newPage;

    return newPage;
  } finally {
    context.off('page', collectPage);
    context.off('console', collectConsole);
    context.off('weberror', collectError);
    // A retry duplicates the tab, and a failed attempt would strand it in the
    // context every later test in the worker shares. Close errors stay swallowed
    // so they cannot mask the real failure.
    await Promise.all(
      openedPages
        .filter((page) => page !== handedOver)
        .map((page) => page.close().catch(() => undefined))
    );
  }
};

/** Chromium flushes its profile cache after close, so a plain `rm` races ENOTEMPTY. */
export const removeTestDir = async (dir: string) => {
  await fs.promises.rm(dir, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
};

/** Persisted folders and persons alike are keyed by id with a base64 name. */
export const findByEncodedName = <T extends { name: string }>(
  entries: Record<string, T>,
  name: string
): T | undefined =>
  Object.values(entries).find((entry) => atob(entry.name) === name);

export interface VirtualizedList {
  page: Page;
  rows: Locator;
  first: Locator;
  last: Locator;
  searchFor: string;
  /** What the panel reports it is listing, so the filtered result is exact. */
  listedNames: () => Promise<string[]>;
  scrollToEnd: () => Promise<void>;
  scrollToStart?: () => Promise<void>;
}

/** Panels virtualize through different components and drive scroll differently, so callers supply it. */
export const expectVirtualizedList = async ({
  page,
  rows,
  first,
  last,
  searchFor,
  listedNames,
  scrollToEnd,
  scrollToStart,
}: VirtualizedList) => {
  await expect(first).toBeVisible();
  expect(await rows.count()).toBeLessThan(TEST_LARGE_LIST.SIZE);
  await expect(last).toHaveCount(0);

  await test.step('scrolling to the end renders the last row', async () => {
    await scrollToEnd();

    await expect(last).toBeVisible();
    await expect(first).toHaveCount(0);
  });

  if (scrollToStart) {
    await test.step('the top control comes back to the first row', async () => {
      await scrollToStart();

      await expect(first).toBeVisible();
    });
    await scrollToEnd();
  }

  await test.step('searching after scrolling finds a row that was never rendered', async () => {
    await fillSearchInput(page, searchFor);

    await expect.poll(listedNames).toEqual([searchFor]);
  });
};
