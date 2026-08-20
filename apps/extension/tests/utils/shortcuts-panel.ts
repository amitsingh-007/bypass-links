import { type Page } from '@playwright/test';

export class ShortcutsPanel {
  constructor(readonly page: Page) {}

  async waitForLoading() {
    const loadingOverlay = this.page.getByTestId('loading-overlay');
    await loadingOverlay.waitFor({ state: 'hidden' });
  }

  getRuleElements() {
    return this.page.locator('[data-testid^="rule-"][data-testid$="-alias"]');
  }

  async getRuleCount() {
    return this.getRuleElements().count();
  }

  async addRule() {
    const addButton = this.page.getByRole('button', { name: 'Add' });
    await addButton.click();
  }

  getSearchInput() {
    return this.page.getByPlaceholder('Search');
  }

  getAddRuleButton() {
    return this.page.getByRole('button', { name: 'Add' });
  }

  getMainSaveButton() {
    return this.page.getByRole('button', { name: 'Save' }).last();
  }

  getAliasInputs() {
    return this.page.getByPlaceholder('Enter Alias');
  }

  getWebsiteInputs() {
    return this.page.getByPlaceholder('Enter Website');
  }

  getHeaderElement() {
    return this.page.getByRole('button', { name: 'Back' });
  }
}
