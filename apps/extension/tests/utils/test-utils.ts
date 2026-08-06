import { parseBadgeCount } from '@bypass/shared/tests';
import { expect, type Page } from '@playwright/test';

import { POPUP_HOMEPAGE } from '@/constants';

// Re-export shared utilities for convenience

export const gotoPanel = async (
  page: Page,
  panelName: 'Bookmarks' | 'Persons' | 'Shortcuts'
) => {
  await page.goto(POPUP_HOMEPAGE);
  const panelButton = page.getByRole('button', { name: panelName });
  await expect(panelButton).toBeVisible();
  await panelButton.click();
  await expect(page.getByPlaceholder('Search')).toBeVisible();
};

/**
 * Navigate back from current folder or panel.
 */
export const navigateBack = async (page: Page) => {
  const backButton = page
    .locator('[aria-label="back"]')
    .or(page.getByRole('button', { name: /back/i }))
    .filter({ visible: true })
    .first();
  await backButton.click({ force: true });
};

/**
 * Open a dialog by clicking a button and waiting for the dialog to appear.
 */
export const openDialog = async (
  page: Page,
  buttonName: string | RegExp,
  dialogName: string
) => {
  const addButton = page.getByRole('button', { name: buttonName, exact: true });
  await addButton.click();

  const dialog = page.getByRole('dialog', { name: dialogName });
  await expect(dialog).toBeVisible();

  return dialog;
};

/**
 * Fill an input inside a dialog by placeholder text.
 */
export const fillDialogInput = async (
  dialog: ReturnType<Page['getByRole']>,
  placeholder: string,
  value: string
) => {
  const input = dialog.getByPlaceholder(placeholder);
  await input.fill(value);
};

/**
 * Click a button inside a dialog by its name.
 */
export const clickDialogButton = async (
  dialog: ReturnType<Page['getByRole']>,
  name: string
) => {
  const button = dialog.getByRole('button', { name });
  await button.click();
};

/**
 * Click a specific context menu option by id.
 */
export const clickContextMenuItem = async (page: Page, id: string) => {
  const menuItem = page.getByTestId(`context-menu-item-${id}`);
  await expect(menuItem).toBeVisible();
  await menuItem.click();
};

/**
 * Open a folder by clicking on it.
 */
export const openFolder = async (page: Page, folderName: string) => {
  const folder = page.getByTestId(`folder-item-${folderName}`);
  await expect(folder).toBeVisible();
  await folder.click();
};

/**
 * Get item from chrome.storage.local
 */
export const getStorageItem = async <T = unknown>(
  page: Page,
  key: string
): Promise<T | undefined> => {
  return page.evaluate(async (storageKey) => {
    const result = await chrome.storage.local.get([storageKey]);
    return result[storageKey] as T;
  }, key);
};

/**
 * Get badge count from person bookmark count badge.
 */
export const getBadgeCount = async (
  page: Page,
  name: string
): Promise<number> => {
  const badge = page.getByTestId('person-bookmark-count-badge');
  await expect(badge).toBeVisible();

  const badgeText = (await badge.textContent()) ?? '';

  if (!badgeText.includes(name)) {
    throw new Error(
      `Expected badge to contain "${name}" but got "${badgeText}"`
    );
  }

  return parseBadgeCount(badgeText);
};

export {
  clickDropdownPersonAndGetName,
  closeDialog,
  clearSearchInput,
  fillSearchInput,
  getHeaderPersonCount,
  getNumericBadgeValue,
  parseBadgeCount,
} from '@bypass/shared/tests';
