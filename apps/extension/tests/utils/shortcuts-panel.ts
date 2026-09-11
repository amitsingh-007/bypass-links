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

  /** The header Save, which is the only one that leaves the extension. */
  async saveAll() {
    await this.getMainSaveButton().click();
  }

  getAliasInputs() {
    return this.page.getByPlaceholder('Enter Alias');
  }

  async getAliasValues() {
    return this.getAliasInputs().evaluateAll((inputs) =>
      inputs.map((input) => (input as HTMLInputElement).value)
    );
  }

  getWebsiteInputs() {
    return this.page.getByPlaceholder('Enter Website');
  }

  getHeaderElement() {
    return this.page.getByRole('button', { name: 'Back' });
  }
}
