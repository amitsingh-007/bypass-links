import type { Page } from '@playwright/test';

/**
 * Click the main Save button (for persisting changes to storage).
 */
export const clickSaveButton = async (page: Page) => {
  const saveButton = page.getByRole('button', { name: /save/i }).last();
  await saveButton.click();
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
