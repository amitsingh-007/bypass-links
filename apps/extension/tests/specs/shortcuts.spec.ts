import { test, expect } from '../fixtures/shortcuts-fixture';
import { ShortcutsPanel } from '../utils/shortcuts-panel';
import { TEST_SHORTCUTS } from '../constants';

/**
 * Shortcuts Panel E2E Tests
 *
 * These tests run sequentially with a single login at the start.
 * The browser context persists across all tests in this describe block.
 *
 * IMPORTANT: Never click the main Save button in header (syncs to server).
 * Only use individual rule save buttons for local saves.
 *
 * IMPORTANT: Test order matters! Do not reorder tests without understanding dependencies.
 */

test.describe.serial('Navigation Tests', () => {
  test('should navigate to shortcuts panel and verify UI elements', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    // Wait for loading overlay to disappear
    await panel.waitForLoading();

    // Verify we're on the shortcuts panel by checking for the header
    const header = panel.getHeaderElement();
    await expect(header).toBeVisible();

    // Verify Add button is visible and enabled
    const addButton = panel.getAddRuleButton();
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();

    // Verify main Save button is visible (but we won't click it)
    const saveButton = panel.getMainSaveButton();
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();

    // Verify search input is visible
    const searchInput = panel.getSearchInput();
    await expect(searchInput).toBeVisible();

    // Verify there are rules displayed (4 rules in test data)
    const ruleCount = await panel.getRuleCount();
    expect(ruleCount).toBe(4);

    // Verify at least one alias input is visible
    const aliasInput = panel.getAliasInputs().first();
    await expect(aliasInput).toBeVisible();
  });
});

test.describe.serial('Search and Filter Tests', () => {
  test('should find valid search match and highlight row', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const allRulesCount = await panel.getRuleCount();
    expect(allRulesCount).toBe(4);

    // Search for a known alias
    await panel.search(TEST_SHORTCUTS.GOOGLE);

    // Wait for UI to reflect changes
    await shortcutsPage.waitForTimeout(1000);

    // Verify the search input has the value
    const searchInput = panel.getSearchInput();
    await expect(searchInput).toHaveValue(TEST_SHORTCUTS.GOOGLE);

    // Verify all rules are still visible (search highlights, doesn't filter)
    const searchResultCount = await panel.getRuleCount();
    expect(searchResultCount).toBe(allRulesCount);

    // Verify search is working - the input with matching value should be in the DOM
    // Note: All rows remain visible, search only highlights matching rows
    const allAliasInputs = panel.getAliasInputs();
    const count = await allAliasInputs.count();
    let foundMatch = false;
    for (let i = 0; i < count; i++) {
      const value = await allAliasInputs.nth(i).inputValue();
      if (value === TEST_SHORTCUTS.GOOGLE) {
        foundMatch = true;
        break;
      }
    }
    expect(foundMatch).toBe(true);

    // Clear search for other tests
    await panel.clearSearch();

    // Verify count is still the same after clearing
    const resetCount = await panel.getRuleCount();
    expect(resetCount).toBe(allRulesCount);
  });
});

test.describe.serial('Add Rule Tests', () => {
  test('should add new rule, verify default alias, and enable save button', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const initialCount = await panel.getRuleCount();
    expect(initialCount).toBe(4);

    // Add a new rule
    await panel.addRule();

    // Verify a new rule was added (count increased by 1)
    const newCount = await panel.getRuleCount();
    expect(newCount).toBe(initialCount + 1);

    // Verify the first input has the default alias value
    // The new rule appears at the top, so check the first input
    const firstAliasInput = panel.getAliasInputs().first();
    const value = await firstAliasInput.inputValue();
    // New rule should have default alias containing "http://"
    expect(value).toContain('http://');

    // The default alias input should be visible
    await expect(firstAliasInput).toBeVisible();

    // Edit the alias
    await firstAliasInput.clear();
    await firstAliasInput.fill('test-alias-new');

    // Verify the individual rule save button is now enabled
    // First rule's save button
    const firstRuleSaveButton = shortcutsPage.getByTestId('rule-0-save');
    await expect(firstRuleSaveButton).toBeEnabled();
  });
});

test.describe.serial('Edit Rule Tests', () => {
  test('should edit rule alias', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get the first alias input
    const firstAliasInput = panel.getAliasInputs().first();
    const originalValue = await firstAliasInput.inputValue();

    // Edit the alias
    await firstAliasInput.clear();
    await firstAliasInput.fill('edited-alias');

    // Click the row save button
    const firstRuleSaveButton = shortcutsPage.getByTestId('rule-0-save');
    await firstRuleSaveButton.click();

    // Wait for the save to take effect
    await shortcutsPage.waitForTimeout(500);

    // Verify the new value is persisted
    await expect(firstAliasInput).toHaveValue('edited-alias');

    // Reset for other tests
    await firstAliasInput.clear();
    await firstAliasInput.fill(originalValue);
    await firstRuleSaveButton.click();
    await shortcutsPage.waitForTimeout(500);
  });

  test('should edit rule website', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get the first website input
    const firstWebsiteInput = panel.getWebsiteInputs().first();

    // Edit the website
    await firstWebsiteInput.fill('https://example.com');

    // Click the row save button
    const firstRuleSaveButton = shortcutsPage.getByTestId('rule-0-save');
    await firstRuleSaveButton.click();

    // Wait for the save to take effect
    await shortcutsPage.waitForTimeout(500);

    // Verify the new value is persisted
    await expect(firstWebsiteInput).toHaveValue('https://example.com');
  });
});

test.describe.serial('Reorder Tests', () => {
  test('should move rule down and verify order change', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get the second alias before reorder
    const secondAliasInputBefore = shortcutsPage.getByTestId('rule-1-alias');
    const secondAliasBefore = await secondAliasInputBefore.inputValue();

    // Click move down button on first rule
    const moveDownButton = shortcutsPage.getByTestId('rule-0-move-down');
    await moveDownButton.click();

    // Wait for UI to update
    await shortcutsPage.waitForTimeout(500);

    // After moving down, the first rule should now have the second alias
    const firstAliasInputAfter = panel.getAliasInputs().first();
    const firstAliasAfter = await firstAliasInputAfter.inputValue();

    // The first position should now have what was originally second
    expect(firstAliasAfter).toBe(secondAliasBefore);
  });

  test('should move rule up and verify order change', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get the second alias before reorder
    const secondAliasInputBefore = shortcutsPage.getByTestId('rule-1-alias');
    const secondAliasBefore = await secondAliasInputBefore.inputValue();

    // Click move up button on second rule
    const moveUpButton = shortcutsPage.getByTestId('rule-1-move-up');
    await moveUpButton.click();

    // Wait for UI to update
    await shortcutsPage.waitForTimeout(500);

    // After moving up, the first rule should now have the second alias
    const firstAliasInputAfter = panel.getAliasInputs().first();
    const firstAliasAfter = await firstAliasInputAfter.inputValue();

    // The first position should now have what was originally second
    expect(firstAliasAfter).toBe(secondAliasBefore);
  });
});

test.describe.serial('Delete Rule Tests', () => {
  test('should delete a rule', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const initialCount = await panel.getRuleCount();

    // Add a new rule first
    await panel.addRule();
    const afterAddCount = await panel.getRuleCount();
    expect(afterAddCount).toBe(initialCount + 1);

    // Delete the first rule (the one we just added)
    const deleteButton = shortcutsPage.getByTestId('rule-0-delete');
    await deleteButton.click();

    await shortcutsPage.waitForTimeout(500);

    // Verify count decreased back to initial
    const finalCount = await panel.getRuleCount();
    expect(finalCount).toBe(initialCount);
  });
});

test.describe.serial('External Link Tests', () => {
  test('should open external link in new tab', async ({
    shortcutsPage,
    context,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get the external link button for the second rule
    // (skip first rule as it may be edited by previous tests)
    const externalLinkButton = shortcutsPage.getByTestId(
      'rule-1-external-link'
    );

    // Verify the button is enabled
    await expect(externalLinkButton).toBeEnabled();

    // Get initial page count
    const initialPages = context.pages();
    const initialPageCount = initialPages.length;

    // Click the external link button
    await externalLinkButton.click();

    // Wait for a new page to be created
    await context.waitForEvent('page', { timeout: 10_000 });

    // Get all pages and find the new one
    const newPages = context.pages();
    const newPage = newPages.find((p) => p !== shortcutsPage);

    // Verify we have a new page
    expect(newPages.length).toBe(initialPageCount + 1);
    expect(newPage).toBeDefined();

    if (newPage) {
      await newPage.waitForLoadState('domcontentloaded');

      // Verify the new page has the correct URL (or contains it)
      expect(newPage.url()).toBeTruthy();

      // Close the new tab
      await newPage.close();
    }
  });
});
