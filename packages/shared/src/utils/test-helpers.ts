import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '../constants/e2e-tests';

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

  await expect(targetDialog).toBeHidden({ timeout: TEST_TIMEOUTS.LONG_WAIT });
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
 * Wait for debounced updates to apply (default 300ms).
 */
export const waitForDebounce = async (
  page: Page,
  ms = TEST_TIMEOUTS.DEBOUNCE
) => {
  await page.waitForTimeout(ms);
};

/**
 * Fill a search input and wait for debounce.
 */
export const fillSearchInput = async (
  page: Page,
  query: string,
  placeholder = 'Search'
) => {
  const searchInput = page.getByPlaceholder(placeholder);
  await searchInput.fill(query);
  await expect(searchInput).toHaveValue(query);
  await waitForDebounce(page);
};

/**
 * Clear a search input and wait for debounce.
 */
export const clearSearchInput = async (page: Page, placeholder = 'Search') => {
  const searchInput = page.getByPlaceholder(placeholder);
  await searchInput.clear();
  await expect(searchInput).toHaveValue('');
  await waitForDebounce(page);
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
