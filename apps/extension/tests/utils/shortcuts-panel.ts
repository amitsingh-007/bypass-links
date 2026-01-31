import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { navigateBack, waitForDebounce } from './test-utils';

/**
 * Get the rule container by position index.
 * Uses data-testid for reliable access.
 */
const getRuleByPos = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}`);
};

/**
 * Get the alias input for a rule by position.
 */
const getAliasInput = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}-alias`);
};

/**
 * Get the website input for a rule by position.
 */
const getWebsiteInput = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}-website`);
};

/**
 * Get the default checkbox for a rule by position.
 */
const getDefaultCheckbox = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}-default`);
};

/**
 * Get the external link button for a rule by position.
 */
const getExternalLinkButton = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}-external-link`);
};

/**
 * Get the save button for a rule by position.
 */
const getRuleSaveButton = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}-save`);
};

/**
 * Get the delete button for a rule by position.
 */
const getDeleteButton = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}-delete`);
};

/**
 * Get the move up button for a rule by position.
 */
const getMoveUpButton = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}-move-up`);
};

/**
 * Get the move down button for a rule by position.
 */
const getMoveDownButton = (page: Page, pos: number) => {
  return page.getByTestId(`rule-${pos}-move-down`);
};

/**
 * Find the position of a rule by its alias value.
 * Returns -1 if not found.
 */
const findRulePosByAlias = async (
  page: Page,
  alias: string
): Promise<number> => {
  const allInputs = page.getByPlaceholder('Enter Alias');
  const count = await allInputs.count();

  for (let i = 0; i < count; i++) {
    const input = allInputs.nth(i);
    const value = await input.inputValue();
    if (value === alias) {
      return i;
    }
  }

  return -1;
};

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

  async search(
    query: string,
    options?: { visibleTexts?: string[]; hiddenTexts?: string[] }
  ) {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.fill(query);
    await waitForDebounce(this.page);

    if (options?.visibleTexts ?? options?.hiddenTexts) {
      const visibleTexts = options.visibleTexts ?? [];
      const hiddenTexts = options.hiddenTexts ?? [];

      for (const text of visibleTexts) {
        const pos = await findRulePosByAlias(this.page, text);
        expect(pos).toBeGreaterThanOrEqual(0);
        const rule = getRuleByPos(this.page, pos);
        await expect(rule).toBeVisible();
      }

      for (const text of hiddenTexts) {
        const pos = await findRulePosByAlias(this.page, text);
        expect(pos).toBeGreaterThanOrEqual(0);
        const rule = getRuleByPos(this.page, pos);
        await expect(rule).not.toBeVisible();
      }
    }
  }

  async clearSearch() {
    const searchInput = this.page.getByPlaceholder('Search');
    await searchInput.clear();
    await waitForDebounce(this.page);
  }

  async getRuleCount() {
    const allRules = this.page.locator(
      '[data-testid^="rule-"][data-testid$="-alias"]'
    );
    return allRules.count();
  }

  async addRule() {
    const addButton = this.page.getByRole('button', { name: 'Add' });
    await addButton.click();
  }

  async fillRuleAlias(currentAlias: string, newAlias: string) {
    const pos = await findRulePosByAlias(this.page, currentAlias);
    expect(pos).toBeGreaterThanOrEqual(0);
    const aliasInput = getAliasInput(this.page, pos);
    await aliasInput.fill(newAlias);
  }

  async fillRuleWebsite(alias: string, website: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);
    const websiteInput = getWebsiteInput(this.page, pos);
    await websiteInput.fill(website);
  }

  async clickRuleSaveButton(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);
    const saveButton = getRuleSaveButton(this.page, pos);
    await saveButton.click();
  }

  async deleteRule(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const rule = getRuleByPos(this.page, pos);
    await expect(rule).toBeVisible();

    const deleteButton = getDeleteButton(this.page, pos);
    await deleteButton.click();
  }

  async moveRuleUp(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const ruleUpButton = getMoveUpButton(this.page, pos);
    await ruleUpButton.click();
  }

  async moveRuleDown(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const ruleDownButton = getMoveDownButton(this.page, pos);
    await ruleDownButton.click();
  }

  async verifyRuleOrder(expectedAliases: string[]) {
    for (const [index, expectedAlias] of expectedAliases.entries()) {
      const input = getAliasInput(this.page, index);
      await expect(input).toHaveValue(expectedAlias);
    }
  }

  async toggleDefaultRule(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const checkbox = getDefaultCheckbox(this.page, pos);
    await checkbox.check();
  }

  async verifyDefaultRule(alias: string, isDefault: boolean) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const checkbox = getDefaultCheckbox(this.page, pos);
    if (isDefault) {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  }

  async openExternalLink(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const linkButton = getExternalLinkButton(this.page, pos);
    await expect(linkButton).toBeEnabled();

    // Open in new tab and verify
    const newTabPromise = this.page.waitForEvent('popup');
    await linkButton.click();
    const newTab = await newTabPromise;
    await newTab.waitForLoadState('networkidle');

    return newTab;
  }

  async verifyRuleSaveButton(alias: string, isDisabled: boolean) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const saveButton = getRuleSaveButton(this.page, pos);
    if (isDisabled) {
      await expect(saveButton).toBeDisabled();
    } else {
      await expect(saveButton).toBeEnabled();
    }
  }

  async verifyMainSaveButtonDisabled(isDisabled: boolean) {
    const saveButton = this.page.getByRole('button', { name: 'Save' }).last();
    if (isDisabled) {
      await expect(saveButton).toBeDisabled();
    } else {
      await expect(saveButton).toBeEnabled();
    }
  }

  async verifyExternalLinkButtonDisabled(alias: string, isDisabled: boolean) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const linkButton = getExternalLinkButton(this.page, pos);
    if (isDisabled) {
      await expect(linkButton).toBeDisabled();
    } else {
      await expect(linkButton).toBeEnabled();
    }
  }

  async verifyRuleVisible(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const rule = getRuleByPos(this.page, pos);
    await expect(rule).toBeVisible();
  }

  async verifyRuleNotVisible(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const rule = getRuleByPos(this.page, pos);
    await expect(rule).not.toBeVisible();
  }

  async getAliasInputError(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const aliasInput = getAliasInput(this.page, pos);
    const hasError = await aliasInput.evaluate((el: any) => {
      return el.classList.contains('mantine-TextInput-invalid');
    });
    return hasError;
  }

  async getWebsiteInputError(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBeGreaterThanOrEqual(0);

    const websiteInput = getWebsiteInput(this.page, pos);
    const hasError = await websiteInput.evaluate((el: any) => {
      return el.classList.contains('mantine-TextInput-invalid');
    });
    return hasError;
  }

  async navigateBack() {
    await navigateBack(this.page);
  }

  // ============ Verification Helpers ============

  async verifyRuleExists(alias: string) {
    await this.verifyRuleVisible(alias);
  }

  async verifyRuleNotExists(alias: string) {
    const pos = await findRulePosByAlias(this.page, alias);
    expect(pos).toBe(-1);
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

  getRuleElements() {
    return this.page.locator('[data-testid^="rule-"][data-testid$="-alias"]');
  }

  getHeaderElement() {
    return this.page.getByText('Shortcuts');
  }

  // ============ Composite Operations ============

  async addRuleAndSave(alias: string, website: string, isDefault = false) {
    await this.addRule();

    // Get the first rule (newly added)
    const firstAliasInput = getAliasInput(this.page, 0);
    await firstAliasInput.fill(alias);

    const firstWebsiteInput = getWebsiteInput(this.page, 0);
    await firstWebsiteInput.fill(website);

    if (isDefault) {
      const checkbox = getDefaultCheckbox(this.page, 0);
      await checkbox.check();
    }

    // Click save button
    const saveButton = getRuleSaveButton(this.page, 0);
    await saveButton.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async editRule(alias: string, newAlias?: string, newWebsite?: string) {
    if (newAlias) {
      await this.fillRuleAlias(alias, newAlias);
    }
    if (newWebsite) {
      await this.fillRuleWebsite(alias, newWebsite);
    }
    await this.clickRuleSaveButton(alias);
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }
}
