import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '../constants';
import { navigateBack, waitForDebounce } from './test-utils';

/**
 * Get the rule container for a specific alias.
 * The rule contains a TextInput with the alias value.
 */
const getRuleByAlias = (page: Page, alias: string) => {
  // Find the input that has the alias as its value, then get parent containers
  const input = page.locator(`input[value="${alias}"]`);
  return input.locator('..').locator('..').locator('..');
};

/**
 * Get the alias input within a rule container.
 */
const getAliasInput = (page: Page, alias: string) => {
  return page.locator(`input[value="${alias}"]`);
};

/**
 * Get the website input within a rule container.
 */
const getWebsiteInput = (page: Page, alias: string) => {
  // Find the rule first, then get the website input within it
  const rule = getRuleByAlias(page, alias);
  return rule.getByPlaceholder('Enter Website');
};

/**
 * Get the delete button for a specific rule.
 */
const getDeleteButton = (page: Page, alias: string) => {
  const rule = getRuleByAlias(page, alias);
  return rule
    .locator('.mantine-ActionIcon-root')
    .filter({ has: page.locator('svg').nth(3) });
};

/**
 * Get the rule save button (teal color) for a specific rule.
 */
const getRuleSaveButton = (page: Page, alias: string) => {
  const rule = getRuleByAlias(page, alias);
  // The save button is the second-to-last ActionIcon (teal color)
  return rule
    .locator('.mantine-ActionIcon-root')
    .filter({ has: page.locator('svg').nth(2) });
};

/**
 * Get the external link button for a specific rule.
 */
const getExternalLinkButton = (page: Page, alias: string) => {
  const rule = getRuleByAlias(page, alias);
  // The external link button is the third ActionIcon (blue color)
  return rule
    .locator('.mantine-ActionIcon-root')
    .filter({ has: page.locator('svg').nth(1) });
};

/**
 * Get the default checkbox for a specific rule.
 */
const getDefaultCheckbox = (page: Page, alias: string) => {
  const rule = getRuleByAlias(page, alias);
  return rule.getByRole('checkbox');
};

/**
 * ShortcutsPanel utility class for E2E testing of the shortcuts/redirection panel.
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
        const rule = getRuleByAlias(this.page, text);
        await expect(rule).toBeVisible();
      }

      for (const text of hiddenTexts) {
        const rule = getRuleByAlias(this.page, text);
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
    // Count only visible alias inputs by checking each one
    const allInputs = this.page.getByPlaceholder('Enter Alias');
    const allCount = await allInputs.count();
    let visibleCount = 0;

    for (let i = 0; i < allCount; i++) {
      const input = allInputs.nth(i);
      if (await input.isVisible()) {
        visibleCount++;
      }
    }

    return visibleCount;
  }

  async addRule() {
    const addButton = this.page.getByRole('button', { name: 'Add' });
    await addButton.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async fillRuleAlias(currentAlias: string, newAlias: string) {
    const aliasInput = getAliasInput(this.page, currentAlias);
    await aliasInput.fill(newAlias);
  }

  async fillRuleWebsite(alias: string, website: string) {
    const websiteInput = getWebsiteInput(this.page, alias);
    await websiteInput.fill(website);
  }

  async clickRuleSaveButton(alias: string) {
    const saveButton = getRuleSaveButton(this.page, alias);
    await saveButton.click();
  }

  async deleteRule(alias: string) {
    const rule = getRuleByAlias(this.page, alias);
    await expect(rule).toBeVisible();

    const deleteButton = getDeleteButton(this.page, alias);
    await deleteButton.click();

    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);

    await expect(rule).not.toBeVisible();
  }

  async moveRuleUp(alias: string) {
    const rule = getRuleByAlias(this.page, alias);
    // Get the up button from the rule container
    const ruleUpButton = rule
      .locator('.mantine-Button-group')
      .locator('button')
      .first();
    await ruleUpButton.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async moveRuleDown(alias: string) {
    const rule = getRuleByAlias(this.page, alias);
    const ruleDownButton = rule
      .locator('.mantine-Button-group')
      .locator('button')
      .last();
    await ruleDownButton.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async verifyRuleOrder(expectedAliases: string[]) {
    const aliasInputs = this.page.getByPlaceholder('Enter Alias');
    const count = await aliasInputs.count();

    expect(count).toBe(expectedAliases.length);

    for (const [index, expectedAlias] of expectedAliases.entries()) {
      const input = aliasInputs.nth(index);
      await expect(input).toHaveValue(expectedAlias);
    }
  }

  async toggleDefaultRule(alias: string) {
    const checkbox = getDefaultCheckbox(this.page, alias);
    await checkbox.check();
  }

  async verifyDefaultRule(alias: string, isDefault: boolean) {
    const checkbox = getDefaultCheckbox(this.page, alias);
    if (isDefault) {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  }

  async openExternalLink(alias: string) {
    const linkButton = getExternalLinkButton(this.page, alias);
    await expect(linkButton).toBeEnabled();

    // Open in new tab and verify
    const newTabPromise = this.page.waitForEvent('popup');
    await linkButton.click();
    const newTab = await newTabPromise;
    await newTab.waitForLoadState('networkidle');

    return newTab;
  }

  async verifyRuleSaveButton(alias: string, isDisabled: boolean) {
    const saveButton = getRuleSaveButton(this.page, alias);
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
    const linkButton = getExternalLinkButton(this.page, alias);
    if (isDisabled) {
      await expect(linkButton).toBeDisabled();
    } else {
      await expect(linkButton).toBeEnabled();
    }
  }

  async verifyRuleVisible(alias: string) {
    const rule = getRuleByAlias(this.page, alias);
    await expect(rule).toBeVisible();
  }

  async verifyRuleNotVisible(alias: string) {
    const rule = getRuleByAlias(this.page, alias);
    await expect(rule).not.toBeVisible();
  }

  async getAliasInputError(alias: string) {
    const aliasInput = getAliasInput(this.page, alias);
    const hasError = await aliasInput.evaluate((el: any) => {
      return el.classList.contains('mantine-TextInput-invalid');
    });
    return hasError;
  }

  async getWebsiteInputError(alias: string) {
    const websiteInput = getWebsiteInput(this.page, alias);
    const hasError = await websiteInput.evaluate((el: any) => {
      return el.classList.contains('mantine-TextInput-invalid');
    });
    return hasError;
  }

  async navigateBack() {
    await navigateBack(this.page);
  }
}
