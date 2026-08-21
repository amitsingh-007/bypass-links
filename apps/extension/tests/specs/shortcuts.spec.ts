import {
  TEST_SHORTCUTS,
  clearSearchInput,
  fillSearchInput,
  openNewPageFromAction,
} from '@bypass/shared/tests';

import { shortcutsTest as test, expect } from '../fixtures/panel-fixture';
import { ShortcutsPanel } from '../utils/shortcuts-panel';

const EXPECTED_RULE_COUNT = Object.keys(TEST_SHORTCUTS).length;

/**
 * Never click the main Save button in the header: it syncs to the server.
 * Only individual rule save buttons save locally.
 */

test.describe('Shortcuts Panel', () => {
  test.describe.configure({ mode: 'parallel' });
  test('should navigate to shortcuts panel and verify UI elements', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    const header = panel.getHeaderElement();
    await expect(header).toBeVisible();

    const addButton = panel.getAddRuleButton();
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();

    const saveButton = panel.getMainSaveButton();
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();

    const searchInput = panel.getSearchInput();
    await expect(searchInput).toBeVisible();

    const ruleCount = await panel.getRuleCount();
    expect(ruleCount).toBe(EXPECTED_RULE_COUNT);

    const aliasInput = panel.getAliasInputs().first();
    await expect(aliasInput).toBeVisible();
  });

  test('should search and highlight matching rules', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const allRulesCount = await panel.getRuleCount();
    expect(allRulesCount).toBe(EXPECTED_RULE_COUNT);

    await fillSearchInput(shortcutsPage, TEST_SHORTCUTS.GOOGLE);

    const searchInput = panel.getSearchInput();
    await expect(searchInput).toHaveValue(TEST_SHORTCUTS.GOOGLE);

    const searchResultCount = await panel.getRuleCount();
    expect(searchResultCount).toBe(allRulesCount);

    const allAliasInputs = panel.getAliasInputs();
    const count = await allAliasInputs.count();
    const aliasValues = await Promise.all(
      Array.from({ length: count }, async (_, index) =>
        allAliasInputs.nth(index).inputValue()
      )
    );
    expect(aliasValues).toContain(TEST_SHORTCUTS.GOOGLE);

    await clearSearchInput(shortcutsPage);

    const resetCount = await panel.getRuleCount();
    expect(resetCount).toBe(allRulesCount);
  });

  test('should add new rule and verify default alias', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const initialCount = await panel.getRuleCount();
    expect(initialCount).toBe(EXPECTED_RULE_COUNT);

    await panel.addRule();

    const newCount = await panel.getRuleCount();
    expect(newCount).toBe(initialCount + 1);

    const firstAliasInput = panel.getAliasInputs().first();
    const value = await firstAliasInput.inputValue();
    expect(value).toContain('http://');

    await expect(firstAliasInput).toBeVisible();

    await firstAliasInput.clear();
    await firstAliasInput.fill('test-alias-new');

    // Also fill in the website (save button is disabled without website)
    const firstWebsiteInput = panel.getWebsiteInputs().first();
    await firstWebsiteInput.fill('https://test-website.com');

    const firstRuleSaveButton = shortcutsPage.getByTestId('rule-0-save');
    await expect(firstRuleSaveButton).toBeEnabled();
  });

  test('should edit rule alias and website', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    const firstAliasInput = panel.getAliasInputs().first();
    const firstWebsiteInput = panel.getWebsiteInputs().first();
    const firstRuleSaveButton = shortcutsPage.getByTestId('rule-0-save');
    const originalValue = await firstAliasInput.inputValue();
    const originalWebsite = await firstWebsiteInput.inputValue();

    await test.step('edit alias', async () => {
      await firstAliasInput.clear();
      await firstAliasInput.fill('edited-alias');
      await firstRuleSaveButton.click();
      await expect(firstAliasInput).toHaveValue('edited-alias');
    });

    await test.step('restore alias', async () => {
      await firstAliasInput.clear();
      await firstAliasInput.fill(originalValue);
      await firstRuleSaveButton.click();
      await expect(firstAliasInput).toHaveValue(originalValue);
    });

    await test.step('edit website', async () => {
      await firstWebsiteInput.fill('https://example.com');
      await firstRuleSaveButton.click();
      await expect(firstWebsiteInput).toHaveValue('https://example.com');
    });

    await test.step('restore website', async () => {
      await firstWebsiteInput.fill(originalWebsite);
      await firstRuleSaveButton.click();
      await expect(firstWebsiteInput).toHaveValue(originalWebsite);
    });
  });

  test('should reorder rules up and down', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    const firstAliasInputBefore = shortcutsPage.getByTestId('rule-0-alias');
    const firstAliasBefore = await firstAliasInputBefore.inputValue();

    const moveDownButton = shortcutsPage.getByTestId('rule-0-move-down');
    await moveDownButton.click();

    const secondAliasInputAfter = shortcutsPage.getByTestId('rule-1-alias');

    await expect(secondAliasInputAfter).toHaveValue(firstAliasBefore);

    const moveUpButton = shortcutsPage.getByTestId('rule-1-move-up');
    await moveUpButton.click();

    const firstAliasInputFinal = shortcutsPage.getByTestId('rule-0-alias');
    await expect(firstAliasInputFinal).toHaveValue(firstAliasBefore);
  });

  test('should delete a rule', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const initialCount = await panel.getRuleCount();

    await panel.addRule();
    const afterAddCount = await panel.getRuleCount();
    expect(afterAddCount).toBe(initialCount + 1);

    const deleteButton = shortcutsPage.getByTestId('rule-0-delete');
    await deleteButton.click();

    await expect(panel.getRuleElements()).toHaveCount(initialCount);
  });

  test('should open external link in new tab', async ({
    shortcutsPage,
    context,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);
    await panel.waitForLoading();

    const websiteInput = shortcutsPage.getByTestId('rule-1-website');
    const expectedWebsite = await websiteInput.inputValue();
    expect(expectedWebsite.length).toBeGreaterThan(0);

    const externalLinkButton = shortcutsPage.getByTestId(
      'rule-1-external-link'
    );
    await expect(externalLinkButton).toBeEnabled();

    const newPage = await openNewPageFromAction(context, async () => {
      await externalLinkButton.click();
    });

    const newPageUrl = newPage.url();
    expect(newPageUrl).toMatch(/^https?:\/\/.+/);

    const actualHostname = new URL(newPageUrl).hostname.replace(/^www\./, '');
    const expectedHostname = new URL(expectedWebsite).hostname.replace(
      /^www\./,
      ''
    );
    expect(actualHostname).toBe(expectedHostname);

    await newPage.close();
  });
});
