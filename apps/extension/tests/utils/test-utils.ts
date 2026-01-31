import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';

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
 * Open a person's tagged bookmarks by clicking on the person card.
 */
export const openPersonCard = async (page: Page, personName: string) => {
  const personCard = page.getByTestId(`person-item-${personName}`);
  await expect(personCard).toBeVisible();
  await personCard.click();
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
 * Close a dialog via the close button or Escape key.
 */
export const closeDialog = async (
  page: Page,
  dialog: ReturnType<Page['getByRole']>
) => {
  const closeButton = page.getByTestId('modal-close-button');
  if (await closeButton.isVisible()) {
    await closeButton.click();
  } else {
    await page.keyboard.press('Escape');
  }

  await expect(dialog).toBeHidden();
};

/**
 * Click a specific context menu option by text.
 */
export const clickContextMenuItem = async (page: Page, itemText: string) => {
  const menuItem = page.locator('.mantine-contextmenu-item-button-title', {
    hasText: itemText,
  });
  await menuItem.waitFor({ state: 'attached' });
  await menuItem.evaluate((el) => (el as HTMLElement).click());
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
 * Count elements matching a selector.
 */
export const countElements = async (page: Page, selector: string) => {
  return page.locator(selector).count();
};

/**
 * Open ImagePicker dialog by clicking edit icon.
 */
export const openImagePicker = async (
  page: Page,
  dialog: ReturnType<Page['getByRole']>
) => {
  const editIcon = dialog.locator('.mantine-ActionIcon-root');
  await editIcon.click();

  const imagePickerDialog = page
    .locator('.mantine-Modal-inner')
    .filter({ hasText: 'Upload Image' });
  await expect(imagePickerDialog).toBeVisible();

  return imagePickerDialog;
};

/**
 * Upload an image by entering URL, waiting for load, and saving.
 */
export const uploadImage = async (
  page: Page,
  imagePickerDialog: ReturnType<Page['locator']>,
  imageUrl: string
) => {
  const imageUrlInput = imagePickerDialog.getByPlaceholder('Enter image url');
  await imageUrlInput.fill(imageUrl);

  const saveCroppedButton = page.getByTestId('save-cropped-image');
  // Wait for the button to become enabled (image loaded and processed)
  await expect(saveCroppedButton).toBeEnabled({
    timeout: TEST_TIMEOUTS.AUTH,
  });
  await saveCroppedButton.click();

  const uploadOverlay = page.getByTestId('uploading-overlay');
  await expect(uploadOverlay).toBeVisible();

  await expect(imagePickerDialog).toBeHidden({ timeout: TEST_TIMEOUTS.AUTH });
};

/**
 * Parse count from badge text in format "Name (N)".
 */
export const getBadgeCount = async (
  page: Page,
  name: string
): Promise<number> => {
  const badge = page.locator('.mantine-Badge-label').filter({ hasText: name });
  await expect(badge).toBeVisible();

  const badgeText = (await badge.textContent()) ?? '';
  const countMatch = /\((\d+)\)/.exec(badgeText);

  if (!countMatch) {
    return 0;
  }

  return Number.parseInt(countMatch[1], 10);
};

/**
 * Toggle a switch by clicking its label.
 */
export const toggleSwitch = async (page: Page, labelText: string) => {
  const label = page.locator('label').filter({ hasText: labelText });
  await label.click();
};

/**
 * Open a folder by clicking on it.
 */
export const openFolder = async (page: Page, folderName: string) => {
  const folder = page.getByTestId(`folder-item-${folderName}`);
  await expect(folder).toBeVisible();
  await folder.click();
};

interface SearchAndVerifyOptions {
  visibleTexts: string[];
  hiddenTexts?: string[];
  selector?: string;
}

/**
 * Search and verify elements are visible/not visible.
 */
export const searchAndVerify = async (
  page: Page,
  searchText: string,
  options: SearchAndVerifyOptions
) => {
  const {
    visibleTexts,
    hiddenTexts = [],
    selector = '[data-testid^="person-item-"]',
  } = options;
  const searchInput = page.getByPlaceholder('Search');
  await searchInput.fill(searchText);
  await waitForDebounce(page);

  for (const text of visibleTexts) {
    const element = page.locator(selector).filter({ hasText: text });
    await expect(element).toBeVisible();
  }

  for (const text of hiddenTexts) {
    const element = page.locator(selector).filter({ hasText: text });
    await expect(element).not.toBeVisible();
  }
};

/**
 * Change image in dialog: open picker, upload, save.
 */
export const changeImageInDialog = async (
  page: Page,
  dialog: ReturnType<Page['getByRole']>,
  imageUrl: string
) => {
  const imagePickerDialog = await openImagePicker(page, dialog);
  await uploadImage(page, imagePickerDialog, imageUrl);
};

/**
 * Get item from chrome.storage.local
 */
export const getStorageItem = async <T = unknown>(
  page: Page,
  key: string
): Promise<T | undefined> => {
  return page.evaluate(async (storageKey) => {
    return new Promise<T>((resolve) => {
      chrome.storage.local.get([storageKey], (result) => {
        resolve(result[storageKey] as T);
      });
    });
  }, key);
};
