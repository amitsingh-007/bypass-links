import { type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { waitForDebounce } from './test-utils';

/**
 * ShortcutsPanel utility class for E2E testing of the shortcuts/redirection panel.
 * All methods use data-testid selectors for reliable element access.
 */
export class ShortcutsPanel {
  constructor(readonly page: Page) {}

  async waitForLoading() {
    const loadingOverlay = this.page.locator('.mantine-LoadingOverlay-root');
    await loadingOverlay.waitFor({
      state: 'hidden',
      timeout: TEST_TIMEOUTS.LONG_WAIT,
    });
  }

  async search(query: string) {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.fill(query);
    await waitForDebounce(this.page);
  }

  async clearSearch() {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.clear();
    await waitForDebounce(this.page);
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

  // ============ Selector Encapsulation ============

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
    return this.page.getByText('Shortcuts');
  }

  // ============ Composite Operations ============
}
