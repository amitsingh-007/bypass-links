---
description: How to create E2E tests for the extension
---

# E2E Test Creation Workflow

This workflow guides you through creating end-to-end tests for the Chrome extension using Playwright, following the project's established best practices.

## Prerequisites

1. Ensure that dev server is running on port 3000.
2. Understand the feature you're testing

## Test Creation Steps

### 1. Identify Test Scope

- Determine what feature/component you're testing
- List all user interactions and expected outcomes
- Identify any required test data or fixtures

### 2. Add Test Data Constants (if needed)

If your test requires specific data that's guaranteed to exist:

```typescript
// apps/extension/tests/constants.ts
export const TEST_BOOKMARKS = {
  REACT_DOCS: 'Bottom Navigation React component - Material-UI1',
  GITHUB: 'React ButtonGroup component 2',
} as const;

export const TEST_FOLDERS = {
  MAIN: 'Main',
  EMPTY: 'Empty folder',
} as const;
```

### 3. Add Data Attributes to Components (if needed)

For robust selectors, add semantic data attributes to components:

```tsx
// In the component file
<div data-folder-name={folderName}>
  {/* component content */}
</div>

<div data-context-id={contextId}>
  {/* component content */}
</div>
```

**Naming conventions:**

- Use `data-*` attributes for test selectors
- Use descriptive names: `data-folder-name`, `data-context-id`, `data-group-context-id`
- Place on the parent/container element

### 4. Write the Test

Create or update test file in `apps/extension/tests/specs/`:

```typescript
import { test, expect } from '../fixtures/bookmark-fixture';
import { TEST_BOOKMARKS } from '../constants';

test.describe.serial('Feature Name', () => {
  // Group related tests with test.describe (only if 2+ tests)
  test.describe('Sub-feature Group', () => {
    test('should perform specific action', async ({ bookmarksPage }) => {
      // Test implementation
    });

    test('should handle edge case', async ({ bookmarksPage }) => {
      // Test implementation
    });
  });

  // Single tests don't need test.describe wrapper
  test('should perform another action', async ({ bookmarksPage }) => {
    // Test implementation
  });
});
```

## Selector Best Practices

### Priority Order (Use in this order)

1. **Accessible Role Selectors** (Highest Priority)

   ```typescript
   bookmarksPage.getByRole('button', { name: 'Add' });
   bookmarksPage.getByRole('dialog', { name: 'Add folder' });
   ```

2. **Data Attribute Selectors**

   ```typescript
   // Specific element by unique attribute
   bookmarksPage.locator('[data-folder-name="Main"]');

   // Filter by content
   bookmarksPage
     .locator('div[data-context-id]')
     .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
   ```

3. **Placeholder/Label Selectors**

   ```typescript
   dialog.getByPlaceholder('Enter folder name');
   bookmarksPage.getByLabel('Username');
   ```

4. **Title/Alt Selectors**

   ```typescript
   bookmarksPage.getByTitle('Edit Bookmark');
   bookmarksPage.getByAltText('User avatar');
   ```

5. **Text Content** (Use sparingly)
   ```typescript
   bookmarksPage.getByText('Tagged Persons');
   ```

### What NOT to Use

❌ **Avoid these selectors:**

- Class selectors: `[class*="Folder-module__container"]`, `.mantine-HoverCard-dropdown`
- Regex for simple text: `{ name: /add/i }` → Use `{ name: 'Add' }`
- Positional selectors when specific selection is possible: `.first()`, `.nth()`
- Generic CSS selectors without semantic meaning
- Generic element selectors: `img`, `div`, `span` (use data attributes instead)
- `.evaluate()` for clicks (use direct `.click()` instead)

### When Positional Selectors Are OK

✅ **Acceptable uses of `.first()` and `.nth()`:**

- Generic UI elements without unique identifiers (when data attributes can't be added)
- Tests that need "any" element rather than a specific one
- Temporary UI elements (tooltips, context menus) where adding data attributes is impractical

```typescript
// OK: Generic avatar in a group when you need any avatar
const avatar = avatarGroup.locator('[data-person-uid]').first();

// OK: Any two bookmarks for multi-select test
const firstBookmark = bookmarkRows.first();
const secondBookmark = bookmarkRows.nth(1);
```

### Avoid `.evaluate()` for Interactions

❌ **Bad - Using evaluate for clicks:**

```typescript
await element.evaluate((el) => (el as HTMLElement).click());
```

✅ **Good - Direct interaction:**

```typescript
await element.click();
```

**Note:** Only use `.evaluate()` as a last resort for elements that are truly not actionable. Most cases can be solved with proper selectors or waiting for the element to be ready.

## Coding Style Guidelines

### 1. Use Exact Text Matches

```typescript
// ✅ Good - Exact match
const addButton = bookmarksPage.getByRole('button', { name: 'Add' });
const dialog = bookmarksPage.getByRole('dialog', { name: 'Add folder' });

// ❌ Bad - Unnecessary regex
const addButton = bookmarksPage.getByRole('button', { name: /add/i });
```

### 2. Use Specific Selectors

```typescript
// ✅ Good - Specific data attribute
const folder = bookmarksPage.locator('[data-folder-name="Main"]');

// ❌ Bad - Class selector with filter and .first()
const folder = bookmarksPage
  .locator('[class*="Folder-module__container"]')
  .filter({ hasText: 'Main' })
  .first();
```

### 3. Use Test Constants

```typescript
// ✅ Good - Using constants
const bookmark = bookmarksPage
  .locator('div[data-context-id]')
  .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });

// ❌ Bad - Hardcoded values scattered throughout
const bookmark = bookmarksPage
  .locator('div[data-context-id]')
  .filter({ hasText: 'Bottom Navigation React component - Material-UI1' });
```

### 4. Group Tests Meaningfully

```typescript
// ✅ Good - Only use describe for 2+ tests
test.describe('Folder Operations', () => {
  test('should create a new folder', async ({ bookmarksPage }) => {});
  test('should delete a folder', async ({ bookmarksPage }) => {});
  test('should rename a folder', async ({ bookmarksPage }) => {});
});

// Single test - no wrapper needed
test('should save changes', async ({ bookmarksPage }) => {});

// ❌ Bad - Single test in describe block
test.describe('Save & Persistence', () => {
  test('should save changes', async ({ bookmarksPage }) => {});
});
```

### 5. Add Clear Comments

```typescript
test('should edit bookmark via context menu', async ({ bookmarksPage }) => {
  // Ensure we're at the bookmarks root
  const bookmarksButton = bookmarksPage.getByRole('button', {
    name: 'Bookmarks',
  });
  if (await bookmarksButton.isVisible()) {
    await bookmarksButton.click();
  }

  // Select a specific bookmark by title
  const bookmarkRow = bookmarksPage
    .locator('div[data-context-id]')
    .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });

  // Right-click to open context menu
  await bookmarkRow.click({ button: 'right' });
});
```

### 6. Use Proper Element Targeting

```typescript
// ✅ Good - Target parent div to avoid duplicate elements
const bookmark = bookmarksPage
  .locator('div[data-context-id]')
  .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });

// ❌ Bad - May match both parent and child elements
const bookmark = bookmarksPage
  .locator('[data-context-id]')
  .filter({ hasText: TEST_BOOKMARKS.REACT_DOCS });
```

### 7. Add Data Attributes for Complex Components

When dealing with dropdowns, hovers, or dynamic content, add data attributes to make testing easier:

```tsx
// Component file - PersonAvatars.tsx
<HoverCard.Dropdown data-person-dropdown={uid}>
  <Avatar data-person-name={name} data-person-uid={uid} onClick={handleClick} />
</HoverCard.Dropdown>
```

```typescript
// Test file - Clean and specific
const dropdown = bookmarksPage.locator('[data-person-dropdown]');
const avatar = dropdown.locator('[data-person-name]');
const personName = await avatar.getAttribute('data-person-name');
await avatar.click();
```

```typescript
// ❌ Bad - Generic selectors with .first() and .evaluate()
const dropdown = bookmarksPage.locator('.mantine-HoverCard-dropdown').first();
const avatar = dropdown.locator('img').first();
const personName = await avatar.getAttribute('alt');
await avatar.evaluate((el) => (el as HTMLElement).click());
```

## Common Patterns

### Opening a Dialog

```typescript
const addButton = bookmarksPage.getByRole('button', { name: 'Add' });
await addButton.click();

const dialog = bookmarksPage.getByRole('dialog', { name: 'Add folder' });
await expect(dialog).toBeVisible();
```

### Filling a Form

```typescript
await dialog.getByPlaceholder('Enter folder name').fill('Test Folder');
await dialog.getByRole('button', { name: 'Save' }).click();
await expect(dialog).toBeHidden();
```

### Context Menu Interaction

```typescript
await element.click({ button: 'right' });

const editOption = bookmarksPage.locator(
  '.mantine-contextmenu-item-button-title',
  { hasText: 'Edit' }
);
await editOption.waitFor({ state: 'attached' });
// Use evaluate only if direct click doesn't work
await editOption.evaluate((el) => (el as HTMLElement).click());
```

### Hover and Dropdown Interaction

```typescript
// Hover over element to show dropdown
const avatar = bookmarksPage.locator('[data-person-uid]').first();
await avatar.hover();

// Wait for dropdown with data attribute
const dropdown = bookmarksPage.locator('[data-person-dropdown]');
await expect(dropdown).toBeVisible({ timeout: 10_000 });

// Click element in dropdown
const dropdownAvatar = dropdown.locator('[data-person-name]');
await dropdownAvatar.click();
```

### Multi-Select with Keyboard Modifiers

```typescript
const firstItem = items.first();
await firstItem.click();

const secondItem = items.nth(1);
await secondItem.click({ modifiers: ['Meta'] }); // Cmd/Ctrl+click
```

### Waiting for Navigation

```typescript
const [newPage] = await Promise.all([
  context.waitForEvent('page', { timeout: 15_000 }),
  element.dblclick(),
]);

expect(newPage).toBeTruthy();
```

## Running Tests

// turbo

```bash
# Run all tests
pnpm e2e

# Run all extension tests
pnpm e2e --project=@bypass/extension

# Run specific test file
pnpm e2e apps/extension/tests/specs/bookmarks.spec.ts

# Run tests matching pattern
pnpm e2e --project=@bypass/extension --grep "Bookmarks Panel"

# Debug mode
pnpm e2e --project=@bypass/extension --debug
```

## Debugging Failed Tests

1. **Check screenshots**: `test-results/` directory
2. **View trace**: `pnpm exec playwright show-trace <trace-file>`
3. **Run in headed mode**: Add `--headed` flag
4. **Use debug mode**: Add `--debug` flag
5. **Check selector specificity**: Ensure selectors are unique

## Checklist Before Committing

- [ ] Tests use semantic selectors (roles, data attributes)
- [ ] No regex for simple text matches
- [ ] No class-based selectors
- [ ] No generic element selectors (`img`, `div`) without data attributes
- [ ] Avoid `.evaluate()` for clicks (use direct `.click()`)
- [ ] Test constants defined for reusable data
- [ ] Data attributes added to components if needed
- [ ] Only use `test.describe` for 2+ tests
- [ ] Clear, descriptive test names
- [ ] Comments explain "why", not "what"
- [ ] All tests pass locally
- [ ] Tests are deterministic (no flaky behavior)

## Additional Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Selectors](https://playwright.dev/docs/locators#locate-by-role)
- Project test fixtures: `apps/extension/tests/fixtures/`
- Test utilities: `apps/extension/tests/utils/`
