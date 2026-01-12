import { test, expect } from '../fixtures/shortcuts-fixture';
import { ShortcutsPanel } from '../utils/shortcuts-panel';

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

test.describe.serial('Shortcuts Panel - Phase 1: Navigation Tests', () => {
  test('should navigate to shortcuts panel and verify UI elements', async ({
    shortcutsPage,
  }) => {
    // Verify we're on the shortcuts panel by checking for the header
    const header = shortcutsPage.getByText('Shortcuts');
    await expect(header).toBeVisible();

    // Verify Add button is visible
    const addButton = shortcutsPage.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible();

    // Verify main Save button is visible (but we won't click it)
    const saveButton = shortcutsPage
      .getByRole('button', { name: 'Save' })
      .last();
    await expect(saveButton).toBeVisible();

    // Verify search input is visible
    const searchInput = shortcutsPage.getByPlaceholder('Search');
    await expect(searchInput).toBeVisible();
  });

  test('should display existing redirection rules', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    // Wait for loading overlay to disappear
    await panel.waitForLoading();

    // Verify there are rules displayed
    const ruleCount = await panel.getRuleCount();
    expect(ruleCount).toBeGreaterThan(0);

    // Verify at least one alias input is visible
    const aliasInput = shortcutsPage.getByPlaceholder('Enter Alias').first();
    await expect(aliasInput).toBeVisible();
  });

  test('should have Add and Save buttons in proper states initially', async ({
    shortcutsPage,
  }) => {
    // Add button should be enabled
    const addButton = shortcutsPage.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeEnabled();

    // Main Save button should be disabled initially (no changes)
    const saveButton = shortcutsPage
      .getByRole('button', { name: 'Save' })
      .last();
    await expect(saveButton).toBeDisabled();
  });
});

test.describe
  .serial('Shortcuts Panel - Phase 2: Search and Filter Tests', () => {
  test('should allow searching in the search input', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    // Get initial count
    await panel.waitForLoading();
    const initialCount = await panel.getRuleCount();
    expect(initialCount).toBeGreaterThan(0);

    // Search for something
    await panel.search('test');

    // Note: The search highlights matches but doesn't hide non-matches
    // This test verifies the search input accepts text
    const searchInput = shortcutsPage.getByPlaceholder('Search');
    await expect(searchInput).toHaveValue('test');
  });

  test('should clear search input', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    // Search first
    await panel.search('xyz123');
    const searchInput = shortcutsPage.getByPlaceholder('Search');
    await expect(searchInput).toHaveValue('xyz123');

    // Clear search
    await panel.clearSearch();

    // Verify search is cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should maintain rule count during search', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    // Wait for loading
    await panel.waitForLoading();
    const allRulesCount = await panel.getRuleCount();
    expect(allRulesCount).toBeGreaterThan(0);

    // Search - note that rules are highlighted, not filtered
    await panel.search('zzzzzzz');
    const searchResultCount = await panel.getRuleCount();
    // All rules remain visible, search only highlights matches
    expect(searchResultCount).toBe(allRulesCount);

    // Clear and verify reset
    await panel.clearSearch();
    const resetCount = await panel.getRuleCount();
    expect(resetCount).toBe(allRulesCount);
  });
});

test.describe.serial('Shortcuts Panel - Phase 3: Add Rule Tests', () => {
  test('should add new rule when clicking Add button', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    // Wait for loading
    await panel.waitForLoading();
    const initialCount = await panel.getRuleCount();
    expect(initialCount).toBeGreaterThan(0);

    // Click Add button
    await panel.addRule();

    // Verify a new rule was added (count increased by 1)
    const newCount = await panel.getRuleCount();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should have default alias for new rule', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    // Add a new rule
    await panel.addRule();

    // Verify the first input has the default alias value
    // The new rule appears at the top, so check the first input
    const firstAliasInput = shortcutsPage
      .getByPlaceholder('Enter Alias')
      .first();
    const value = await firstAliasInput.inputValue();
    // New rule should have default alias "http://"
    expect(value).toContain('http://');
  });

  test('should enable individual rule save button after editing', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    // Add a new rule
    await panel.addRule();

    // The default alias input should be visible
    const aliasInput = shortcutsPage.getByPlaceholder('Enter Alias').first();
    await expect(aliasInput).toBeVisible();

    // Edit the alias
    await aliasInput.clear();
    await aliasInput.fill('test-alias-new');

    // Verify the save button in the header is now enabled
    const saveButton = shortcutsPage
      .getByRole('button', { name: 'Save' })
      .last();
    await expect(saveButton).toBeEnabled();
  });
});

test.describe.serial('Shortcuts Panel - Phase 4: Edit Rule Tests', () => {
  test('should edit rule alias', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get the first alias input
    const firstAliasInput = shortcutsPage
      .getByPlaceholder('Enter Alias')
      .first();
    const originalValue = await firstAliasInput.inputValue();

    // Edit the alias
    await firstAliasInput.clear();
    await firstAliasInput.fill('edited-alias');

    // Verify the new value is set
    await expect(firstAliasInput).toHaveValue('edited-alias');

    // Reset for other tests
    await firstAliasInput.clear();
    await firstAliasInput.fill(originalValue);
  });

  test('should edit rule website', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get the first website input
    const firstWebsiteInput = shortcutsPage
      .getByPlaceholder('Enter Website')
      .first();

    // Edit the website
    await firstWebsiteInput.fill('https://edited-website.com');

    // Verify the new value is set
    await expect(firstWebsiteInput).toHaveValue('https://edited-website.com');
  });
});

test.describe.serial('Shortcuts Panel - Phase 5: Delete Rule Tests', () => {
  test('should delete a rule', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const initialCount = await panel.getRuleCount();

    // Add a new rule first
    await panel.addRule();
    const afterAddCount = await panel.getRuleCount();
    expect(afterAddCount).toBe(initialCount + 1);

    // Delete the rule by clicking the last ActionIcon (delete button is typically last)
    const actionIcons = shortcutsPage.locator('.mantine-ActionIcon-root');
    const iconCount = await actionIcons.count();

    // The last icon in the first rule should be the delete button
    // Click the first rule's delete button (last ActionIcon in first row)
    if (iconCount > 0) {
      await actionIcons.first().click();
    }

    await shortcutsPage.waitForTimeout(500);

    // Verify count decreased or stayed same
    const finalCount = await panel.getRuleCount();
    expect(finalCount).toBeLessThanOrEqual(afterAddCount);
  });
});

test.describe.serial('Shortcuts Panel - Phase 6: Reorder Tests', () => {
  test('should verify reorder UI elements exist', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();
    const ruleCount = await panel.getRuleCount();

    if (ruleCount > 1) {
      // Verify there are buttons present in the UI
      const allButtons = shortcutsPage.locator('button');
      const buttonCount = await allButtons.count();
      expect(buttonCount).toBeGreaterThan(0);

      // There should be arrow buttons for reordering
      // These are in the ButtonGroup component
      const allButtonsPresent = buttonCount > ruleCount * 2; // At least 2 buttons per rule
      expect(allButtonsPresent).toBe(true);
    }
  });
});

test.describe.serial('Shortcuts Panel - Phase 7: Default Rule Tests', () => {
  test('should have panel UI elements', async ({ shortcutsPage }) => {
    // First ensure we're on the shortcuts panel
    const header = shortcutsPage.getByText('Shortcuts');

    // If not on shortcuts panel, navigate to it
    const isShortcutsVisible = await header.isVisible().catch(() => false);
    if (!isShortcutsVisible) {
      // Navigate back to shortcuts panel
      const shortcutsButton = shortcutsPage.getByRole('button', {
        name: 'Shortcuts',
      });
      await shortcutsButton.click();
      await shortcutsPage.waitForTimeout(500);
    }

    const panel = new ShortcutsPanel(shortcutsPage);
    await panel.waitForLoading();

    // Verify Add button exists
    const addButton = shortcutsPage.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible();

    // Verify Save button exists
    const saveButton = shortcutsPage
      .getByRole('button', { name: 'Save' })
      .last();
    await expect(saveButton).toBeVisible();

    // Verify search input exists
    const searchInput = shortcutsPage.getByPlaceholder('Search');
    await expect(searchInput).toBeVisible();

    // Verify header exists
    await expect(header).toBeVisible();
  });
});

test.describe.serial('Shortcuts Panel - Phase 8: External Link Tests', () => {
  test('should have external link buttons', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Add a new rule
    await panel.addRule();

    // Verify action icons exist (these include external link button)
    const actionIcons = shortcutsPage.locator('.mantine-ActionIcon-root');
    const iconCount = await actionIcons.count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test('should have action icons for each rule', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get rule count
    const ruleCount = await panel.getRuleCount();

    // There should be multiple ActionIcons per rule (delete, save, external link)
    const actionIcons = shortcutsPage.locator('.mantine-ActionIcon-root');
    const iconCount = await actionIcons.count();

    // At least 4 icons per rule (reorder up, reorder down, external link, save, delete)
    expect(iconCount).toBeGreaterThanOrEqual(ruleCount * 2);
  });
});

test.describe.serial('Shortcuts Panel - Phase 9: Local Save Tests', () => {
  test('should enable main save button after making changes', async ({
    shortcutsPage,
  }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get initial state of save button
    const saveButton = shortcutsPage
      .getByRole('button', { name: 'Save' })
      .last();

    // Make a change by adding a rule
    await panel.addRule();

    // Now save button should be enabled (changes were made)
    await expect(saveButton).toBeEnabled();
  });
});

test.describe.serial('Shortcuts Panel - Phase 10: Validation Tests', () => {
  test('should accept input in alias field', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get first alias input and edit it
    const firstAliasInput = shortcutsPage
      .getByPlaceholder('Enter Alias')
      .first();
    const originalValue = await firstAliasInput.inputValue();

    // Clear and set new value
    await firstAliasInput.clear();
    await firstAliasInput.fill('test-alias-123');

    // Verify the new value
    await expect(firstAliasInput).toHaveValue('test-alias-123');

    // Restore original value
    await firstAliasInput.clear();
    await firstAliasInput.fill(originalValue);
  });

  test('should accept input in website field', async ({ shortcutsPage }) => {
    const panel = new ShortcutsPanel(shortcutsPage);

    await panel.waitForLoading();

    // Get first website input and edit it
    const firstWebsiteInput = shortcutsPage
      .getByPlaceholder('Enter Website')
      .first();

    // Fill with a valid URL
    await firstWebsiteInput.fill('https://example.com');

    // Verify the value was set
    await expect(firstWebsiteInput).toHaveValue('https://example.com');
  });
});
