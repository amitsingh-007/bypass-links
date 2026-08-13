import { instrumentContext } from '@bypass/shared/tests';
import { test as base } from '@playwright/test';

/**
 * For specs that use Playwright's own context instead of the authenticated one,
 * so their pages are still counted in the coverage report.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    instrumentContext(context);
    await use(context);
  },
});

export const { expect } = test;
