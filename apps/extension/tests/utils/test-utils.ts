import { expect, type Page } from '@playwright/test';

import { POPUP_HOMEPAGE } from '@/constants';

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

export const navigateBack = async (page: Page) => {
  const backButton = page
    .locator('[aria-label="back"]')
    .or(page.getByRole('button', { name: /back/i }))
    .filter({ visible: true })
    .first();
  await backButton.click({ force: true });
};

export const openAddDialog = async (page: Page, dialogName: string) => {
  const addButton = page.getByRole('button', { name: 'Add', exact: true });
  await addButton.click();

  const dialog = page.getByRole('dialog', { name: dialogName });
  await expect(dialog).toBeVisible();

  return dialog;
};

export const fillDialogInput = async (
  dialog: ReturnType<Page['getByRole']>,
  placeholder: string,
  value: string
) => {
  const input = dialog.getByPlaceholder(placeholder);
  await input.fill(value);
};

export const clickDialogButton = async (
  dialog: ReturnType<Page['getByRole']>,
  name: string
) => {
  const button = dialog.getByRole('button', { name });
  await button.click();
};

export const clickContextMenuItem = async (page: Page, id: string) => {
  const menuItem = page.getByTestId(`context-menu-item-${id}`);
  await expect(menuItem).toBeVisible();
  await menuItem.click();
};

export const getStorageItem = async <T = unknown>(
  page: Page,
  key: string
): Promise<T | undefined> => {
  return page.evaluate(async (storageKey) => {
    const result = await chrome.storage.local.get([storageKey]);
    return result[storageKey] as T;
  }, key);
};
