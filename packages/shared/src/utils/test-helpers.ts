import {
  expect,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test';

type TestIdScope = Pick<Page, 'getByTestId'>;

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

/**
 * Verify a shadcn modal/dialog is closed.
 * Unlike Mantine (which kept modals in DOM), shadcn removes them from DOM when closed.
 */
export const verifyModalClosed = async (page: Page, modalTestId?: string) => {
  if (modalTestId) {
    const modal = page.getByTestId(modalTestId);
    await expect(modal).not.toBeAttached();
  } else {
    // Check that no dialog is visible
    const dialogs = page.getByRole('dialog');
    await expect(dialogs).toHaveCount(0);
  }
};

/**
 * Verify a shadcn modal/dialog is open and visible.
 */
export const verifyModalVisible = async (page: Page, modalTestId?: string) => {
  if (modalTestId) {
    const modal = page.getByTestId(modalTestId);
    await expect(modal).toBeVisible();
  } else {
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  }
};

/**
 * Fill a search input.
 */
export const fillSearchInput = async (
  page: Page,
  query: string,
  placeholder = 'Search'
) => {
  const searchInput = page.getByPlaceholder(placeholder);
  await searchInput.fill(query);
  await expect(searchInput).toHaveValue(query);
};

/**
 * Clear a search input.
 */
export const clearSearchInput = async (page: Page, placeholder = 'Search') => {
  const searchInput = page.getByPlaceholder(placeholder);
  await searchInput.clear();
  await expect(searchInput).toHaveValue('');
};

/**
 * Click a button by its visible text/label.
 */
export const clickButtonByName = async (
  page: Page,
  name: string | RegExp,
  options?: { exact?: boolean; within?: ReturnType<Page['locator']> }
) => {
  const scope = options?.within ?? page;
  const button = scope.getByRole('button', {
    name,
    exact: options?.exact ?? false,
  });
  await button.click();
};

/**
 * Get the count from a badge text in format "Name (N)" or just "(N)".
 */
export const parseBadgeCount = (badgeText: string): number => {
  const match = /\((\d+)\)/.exec(badgeText);
  return match ? Number.parseInt(match[1], 10) : 0;
};

/**
 * Read a numeric badge value from a test id.
 */
export const getNumericBadgeValue = async (
  scope: TestIdScope,
  testId: string,
  options?: { fallbackToAnyNumber?: boolean }
): Promise<number> => {
  const badge = scope.getByTestId(testId);
  await expect(badge).toBeVisible();

  const text = (await badge.textContent()) ?? '';
  const countFromParentheses = parseBadgeCount(text);
  if (countFromParentheses > 0 || !options?.fallbackToAnyNumber) {
    return countFromParentheses;
  }

  const firstNumberMatch = /\b(\d+)\b/.exec(text);
  return firstNumberMatch ? Number.parseInt(firstNumberMatch[1], 10) : 0;
};

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
 * Run an action that should open a new page and return it.
 */
export const openNewPageFromAction = async (
  context: BrowserContext,
  action: () => Promise<void>,
  options?: { timeout?: number }
): Promise<Page> => {
  const existingPages = context.pages();
  const existingPageSet = new Set(existingPages);

  await action();

  await expect
    .poll(() => context.pages().length, { timeout: options?.timeout ?? 10_000 })
    .toBeGreaterThan(existingPages.length);

  const newPage = context.pages().find((page) => !existingPageSet.has(page));
  if (!newPage) {
    throw new Error('Expected action to open a new page');
  }

  await expect
    .poll(() => newPage.url(), { timeout: options?.timeout ?? 10_000 })
    .not.toBe('about:blank');

  return newPage;
};
