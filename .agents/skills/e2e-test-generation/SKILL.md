---
name: e2e-test-generation
description: Create or update Playwright E2E tests for the Bypass Links Chrome extension.
---

# E2E test generation

Use this skill for extension E2E tests in `apps/extension/tests/specs/`. Read a nearby spec and its fixture before writing a test.

## Fixtures

Choose the fixture for the behavior under test:

- `panel-fixture.ts` exports `bookmarkTest`, `personsTest`, and `shortcutsTest` for signed-in panels.
- `home-popup-fixture.ts` exports `test` for popup behavior.
- `background-fixture.ts` exports `test` for service worker and page behavior.
- `auth-fixture.ts` exports `test` for authentication behavior.

Reuse the selected fixture's browser setup, including profile isolation and authentication where applicable.

## Test conventions

- Prefer `getByTestId()` for stable UI controls, then accessible roles, labels or placeholders, and exact text. Use title or alt text only when a better selector is unavailable. Add a `data-testid` when a control lacks a stable selector.
- Avoid class selectors, generic element selectors, custom data attributes, and positional selectors when a stable semantic selector exists. Use exact labels instead of regex when the label is stable.
- Use Playwright actions for UI interactions. `evaluate()` is appropriate for inspecting or setting browser, DOM, or extension state when Playwright has no direct API; do not use it to click UI controls.
- Reuse constants from `@bypass/shared/tests`. Keep test-specific values local to the spec.
- Use `test.describe` for two or more related tests. Use `test.step` when it clarifies a test with several distinct phases; keep value-producing setup outside steps. Do not wrap page-object methods in steps or set `box: true`, which hides the failing inner action in CI logs.
- Assert observable state and wait for conditions instead of using fixed sleeps. Keep comments only for reasons the test cannot express.

## Verify

Run the changed spec after writing it:

```bash
pnpm e2e apps/extension/tests/specs/<file>.spec.ts
```
