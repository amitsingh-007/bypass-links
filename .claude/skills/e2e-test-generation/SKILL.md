---
name: e2e-test-generation
description: Create E2E tests for Chrome extension using Playwright
license: MIT
compatibility: opencode
metadata:
  audience: developers
  framework: playwright
  target: extension
---

## What I do

- Create Playwright E2E tests for the Chrome extension
- Add semantic selectors (role-based, data attributes) instead of class selectors
- Add data attributes to components when needed for robust test selectors
- Define test constants for reusable test data in `apps/extension/tests/constants.ts`
- Follow project conventions: test.describe for 2+ tests, exact text matches, no evaluate() for clicks
- Use project fixtures: `import { test, expect } from '../fixtures/bookmark-fixture'`
- Run the generated test file after making changes

## When to use me

Use this when you need to create new E2E tests or update existing tests for the Chrome extension.

I will ask clarifying questions if:

- The feature to test is not clearly defined
- You need to test across multiple projects (extension vs web app)
- Test data requirements are unclear

## Selector Priority (use in this order)

1. **Accessible Role Selectors** (highest priority)

   ```typescript
   bookmarksPage.getByRole('button', { name: 'Add' });
   bookmarksPage.getByRole('dialog', { name: 'Add folder' });
   ```

2. **Data Attribute Selectors**

   ```typescript
   bookmarksPage.locator('[data-folder-name="Main"]');
   bookmarksPage.locator('div[data-context-id]').filter({ hasText: 'text' });
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

5. **Text Content** (use sparingly)
   ```typescript
   bookmarksPage.getByText('Tagged Persons');
   ```

## Selector Anti-Patterns (NEVER use)

- Class selectors: `[class*="Folder-module__container"]`, `.mantine-HoverCard-dropdown`
- Regex for simple text: `{ name: /add/i }` → use `{ name: 'Add' }`
- Positional selectors when specific selection is possible: `.first()`, `.nth()`
- Generic CSS selectors without semantic meaning
- Generic element selectors: `img`, `div`, `span` (use data attributes instead)
- `.evaluate()` for clicks (use direct `.click()` instead)

## When Positional Selectors Are OK

- Generic UI elements without unique identifiers (when data attributes can't be added)
- Tests that need "any" element rather than a specific one
- Temporary UI elements (tooltips, context menus) where adding data attributes is impractical

## Coding Style Guidelines

- **Exact text matches**: Use `{ name: 'Add' }` not `{ name: /add/i }`
- **Specific selectors**: Target parent div to avoid duplicate elements
- **Test constants**: Define constants in `apps/extension/tests/constants.ts` for reusable data
- **Group tests**: Only use `test.describe` for 2+ tests
- **Clear comments**: Explain "why", not "what"

## Common Patterns

**Opening a dialog:**

```typescript
const addButton = bookmarksPage.getByRole('button', { name: 'Add' });
await addButton.click();
const dialog = bookmarksPage.getByRole('dialog', { name: 'Add folder' });
await expect(dialog).toBeVisible();
```

**Filling a form:**

```typescript
await dialog.getByPlaceholder('Enter folder name').fill('Test Folder');
await dialog.getByRole('button', { name: 'Save' }).click();
await expect(dialog).toBeHidden();
```

**Context menu:**

```typescript
await element.click({ button: 'right' });
const editOption = bookmarksPage.locator(
  '.mantine-contextmenu-item-button-title',
  { hasText: 'Edit' }
);
await editOption.waitFor({ state: 'attached' });
await editOption.evaluate((el) => (el as HTMLElement).click());
```

**Multi-select with keyboard:**

```typescript
await firstItem.click();
await secondItem.click({ modifiers: ['Meta'] }); // Cmd/Ctrl+click
```

**Waiting for navigation:**

```typescript
const [newPage] = await Promise.all([
  context.waitForEvent('page', { timeout: 15_000 }),
  element.dblclick(),
]);
expect(newPage).toBeTruthy();
```

## After Test Creation

Run the generated test file to verify it works:

```bash
playwright test apps/extension/tests/specs/<your-test-file>.spec.ts
```

## Checklist Before Committing

- [ ] Tests use semantic selectors (roles, data attributes)
- [ ] No regex for simple text matches
- [ ] No class-based selectors
- [ ] No generic element selectors without data attributes
- [ ] Avoid `.evaluate()` for clicks (use direct `.click()`)
- [ ] Test constants defined for reusable data
- [ ] Data attributes added to components if needed
- [ ] Only use `test.describe` for 2+ tests
- [ ] Clear, descriptive test names
- [ ] All tests pass locally
- [ ] Tests are deterministic (no flaky behavior)
