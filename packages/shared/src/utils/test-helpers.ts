import fs from 'node:fs';

import {
  expect,
  type BrowserContext,
  type ConsoleMessage,
  type Locator,
  type Page,
  type WebError,
} from '@playwright/test';

import { TEST_TIMEOUTS } from '../constants/e2e-tests';

type TestIdScope = Pick<Page, 'getByTestId'>;

export const dumpLocalStorage = async (
  page: Page
): Promise<Record<string, string>> =>
  Object.fromEntries(
    (await page.localStorage.items()).map(({ name, value }) => [name, value])
  );

/** Seeds localStorage before any page script runs. */
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

/**
 * Close a shadcn dialog using the close button or Escape key.
 * This is the unified pattern for closing dialogs after Mantine migration.
 */
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

/**
 * Fill a search input.
 */
export const fillSearchInput = async (
  scope: SearchScope,
  query: string,
  placeholder = 'Search'
) => {
  const searchInput = scope.getByPlaceholder(placeholder);
  await searchInput.fill(query);
  await expect(searchInput).toHaveValue(query);
};

/**
 * Clear a search input.
 */
export const clearSearchInput = async (
  scope: SearchScope,
  placeholder = 'Search'
) => {
  const searchInput = scope.getByPlaceholder(placeholder);
  await searchInput.clear();
  await expect(searchInput).toHaveValue('');
};

/**
 * Get the count from a badge text in format "Name (N)" or just "(N)".
 */
export const parseBadgeCount = (badgeText: string): number => {
  const match = /\((\d+)\)/.exec(badgeText);
  return match ? Number.parseInt(match[1], 10) : 0;
};

/**
 * Read a numeric badge value from a test id, falling back to the first number
 * in the text when the badge is not in "(N)" form.
 */
export const getNumericBadgeValue = async (
  scope: TestIdScope,
  testId: string
): Promise<number> => {
  const badge = scope.getByTestId(testId);
  await expect(badge).toBeVisible();

  const text = (await badge.textContent()) ?? '';
  if (/\(\d+\)/.test(text)) {
    return parseBadgeCount(text);
  }

  const firstNumberMatch = /\b(\d+)\b/.exec(text);
  return firstNumberMatch ? Number.parseInt(firstNumberMatch[1], 10) : 0;
};

export const getHeaderPersonCount = async (
  scope: TestIdScope
): Promise<number> => getNumericBadgeValue(scope, 'header-badge');

/**
 * Click the first person avatar in a dropdown and return person name.
 */
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

/**
 * Opens a bookmark from the shared `Bookmark` row. The title is double-clicked
 * rather than the row: it fills the row's remaining width, so it cannot shift
 * under a person hover card while avatars are still loading.
 */
export const dblclickBookmark = async (scope: TestIdScope, title: string) =>
  scope
    .getByTestId(`bookmark-item-${title}`)
    .getByTestId(`bookmark-title-${title}`)
    .dblclick();

/**
 * Run an action that should open a new page and return it. The action is retried
 * because a gesture swallowed by a re-render leaves no trace beyond the tab never
 * arriving, so every caller's action has to be idempotent.
 */
export const openNewPageFromAction = async (
  context: BrowserContext,
  action: () => Promise<void>
): Promise<Page> => {
  const openedPages: Page[] = [];
  const collectPage = (page: Page) => openedPages.push(page);
  context.on('page', collectPage);
  /**
   * A refused open leaves no trace but what the page logged, and without it a
   * flake here is indistinguishable from a gesture that never landed.
   */
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
      /**
       * Appended here rather than in the poll's message, which is templated
       * before the poll runs and so misses everything logged while it waited.
       */
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
    /**
     * Everything the action opened is closed unless it is being handed to the
     * caller: a retry duplicates the tab, and a failing attempt would otherwise
     * strand one in the context every later test in the worker shares. Close
     * errors stay swallowed so they cannot mask the failure that got us here.
     */
    await Promise.all(
      openedPages
        .filter((page) => page !== handedOver)
        .map((page) => page.close().catch(() => undefined))
    );
  }
};

/**
 * Chromium keeps flushing its profile cache for a moment after the context
 * closes, so a plain `rm` loses the race with ENOTEMPTY.
 */
export const removeTestDir = async (dir: string) => {
  await fs.promises.rm(dir, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
};
