---
name: e2e-test-generation
description: Create E2E tests for Chrome extension using Playwright
---

# E2E Test Generation

- Create Playwright E2E tests for the Chrome extension
- Use `data-testid` and `getByTestId()` as the primary test selector pattern
- Add semantic selectors (role-based, data-testid) instead of class selectors
- Add `data-testid` attributes to components when needed for robust test selectors
- Reuse shared test constants from `@bypass/shared/tests` and add local constants only when test-specific
- Follow project conventions: test.describe for 2+ tests, exact text matches, no evaluate() for clicks
- Use project fixtures: `import { test, expect } from '../fixtures/bookmark-fixture'`
- Run the generated test file after making changes

## When to Use This Skill

Use this when you need to create new E2E tests or update existing tests for the Chrome extension.

I will ask clarifying questions if:

- The feature to test is not clearly defined
- You need to test across multiple projects (extension vs web app)
- Test data requirements are unclear

## Selector Priority (use in this order)

1. **data-testid with getByTestId()** (project standard, including dynamic patterns)

   ```typescript
   bookmarksPage.getByTestId('folder-item-Main');
   bookmarksPage.locator('[data-testid^="bookmark-item-"]');
   ```

2. **Accessible Role Selectors** (when data-testid not available)

   ```typescript
   bookmarksPage.getByRole('button', { name: 'Add' });
   bookmarksPage.getByRole('dialog', { name: 'Add folder' });
   ```

3. **Placeholder/Label Selectors**

   ```typescript
   dialog.getByPlaceholder('Enter folder name');
   bookmarksPage.getByLabel('History');
   ```

4. **Text Content** (transient UI only: toasts, notifications, short labels)

   ```typescript
   bookmarksPage.getByText('Remove inner folders first');
   ```

5. **Title/Alt Selectors** (fallback when better selectors are unavailable)

   ```typescript
   bookmarksPage.getByTitle('Edit Bookmark');
   bookmarksPage.getByAltText('User avatar');
   ```

## Selector Anti-Patterns (NEVER use)

- Class selectors: `[class*="Folder-module__container"]`, `.some-generated-class`
- Custom data attributes (other than `data-testid`): `data-folder-name`, `data-context-id`, etc.
- Unnecessary regex for stable labels: `{ name: /add/i }` when `{ name: 'Add' }` is sufficient
- Positional selectors when a stable semantic selector is available: `.first()`, `.nth()`
- Generic CSS selectors without semantic meaning
- Generic element selectors: `img`, `div`, `span` (use `data-testid` instead)
- `.evaluate()` for clicks (use direct `.click()` instead)

## Coding Style Guidelines

- **Test constants**: Reuse `@bypass/shared/tests` constants first; keep local constants scoped to a spec when needed
- **Group tests**: Only use `test.describe` for 2+ tests
- **Test names**: Use clear names that describe behavior under test
- **Determinism**: Prefer explicit waits on visible UI state over brittle timing assumptions
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
const editOption = bookmarksPage.getByTestId('context-menu-item-edit');
await expect(editOption).toBeVisible();
await editOption.click();
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

Run the test file to verify it works:

```bash
pnpm e2e apps/extension/tests/specs/<your-test-file>.spec.ts
```

## Rules Before Committing

- Follow selector priority and anti-pattern guidance above
- Reuse shared constants from `@bypass/shared/tests` where possible
- Use `test.describe` only for 2+ related tests
- Keep test names clear and behavior-focused
- Ensure tests pass locally and are deterministic
