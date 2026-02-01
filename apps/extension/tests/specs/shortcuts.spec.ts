import { TEST_SHORTCUTS } from '@bypass/shared/tests';
import { test, expect } from '../fixtures/shortcuts-fixture';
import { ShortcutsPanel } from '../utils/shortcuts-panel';

const EXPECTED_RULE_COUNT = Object.keys(TEST_SHORTCUTS).length;

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

test.describe.serial('Shortcuts Panel', () => {
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

    // Verify there are rules displayed (TEST_SHORTCUTS rules in test data)
    const ruleCount = await panel.getRuleCount();
    expect(ruleCount).toBe(EXPECTED_RULE_COUNT);

    // Verify at least one alias input is visible
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

    // Search for a known alias
    await panel.search(TEST_SHORTCUTS.GOOGLE);

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

  test('should add new rule and verify default alias', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const initialCount = await panel.getRuleCount();
    expect(initialCount).toBe(EXPECTED_RULE_COUNT);

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

  test('should edit rule alias and website', async ({ shortcutsPage }) => {
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

    // Verify the new value is persisted
    await expect(firstAliasInput).toHaveValue('edited-alias');

    // Reset for other tests
    await firstAliasInput.clear();
    await firstAliasInput.fill(originalValue);
    await firstRuleSaveButton.click();

    // Verify reset value persisted
    await expect(firstAliasInput).toHaveValue(originalValue);

    // Edit the website
    const firstWebsiteInput = panel.getWebsiteInputs().first();
    await firstWebsiteInput.fill('https://example.com');
    await firstRuleSaveButton.click();

    // Verify the new value is persisted
    await expect(firstWebsiteInput).toHaveValue('https://example.com');
  });

  test('should reorder rules up and down', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get the first and second aliases before reorder
    const firstAliasInputBefore = shortcutsPage.getByTestId('rule-0-alias');
    const firstAliasBefore = await firstAliasInputBefore.inputValue();

    // Click move down button on first rule
    const moveDownButton = shortcutsPage.getByTestId('rule-0-move-down');
    await moveDownButton.click();

    // After moving down, the second rule should now have the first alias
    const secondAliasInputAfter = shortcutsPage.getByTestId('rule-1-alias');

    // Verify the reorder - second rule now has the first alias
    await expect(secondAliasInputAfter).toHaveValue(firstAliasBefore);

    // Move it back up using the up button on the second rule
    const moveUpButton = shortcutsPage.getByTestId('rule-1-move-up');
    await moveUpButton.click();

    // Verify it's back to original order - first rule has first alias again
    const firstAliasInputFinal = shortcutsPage.getByTestId('rule-0-alias');
    await expect(firstAliasInputFinal).toHaveValue(firstAliasBefore);
  });

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

    // Verify count decreased back to initial
    await expect(panel.getRuleElements()).toHaveCount(initialCount, {
      timeout: 3000,
    });
  });

  test('should open external link in new tab', async ({
    shortcutsPage,
    context,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);
    await panel.waitForLoading();

    // Get the website URL from the second rule to validate against later
    const websiteInput = shortcutsPage.getByTestId('rule-1-website');
    const expectedWebsite = await websiteInput.inputValue();
    expect(expectedWebsite.length).toBeGreaterThan(0);

    // Get the external link button for the second rule
    const externalLinkButton = shortcutsPage.getByTestId(
      'rule-1-external-link'
    );
    await expect(externalLinkButton).toBeEnabled();

    // Click and wait for new page to open
    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 10_000 }),
      externalLinkButton.click(),
    ]);

    // Wait for navigation to complete
    await expect
      .poll(() => newPage.url(), {
        timeout: 10_000,
        message: 'Page should navigate from about:blank to actual URL',
      })
      .not.toBe('about:blank');

    // Verify the URL matches expected website (ignoring www. prefix)
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
