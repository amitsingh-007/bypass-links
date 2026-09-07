import { instrumentContext } from '@bypass/shared/tests';
import { test as base } from '@playwright/test';

/** Auth comes from the project's `storageState`; this only adds coverage instrumentation. */
export const test = base.extend({
  async context({ context }, use) {
    instrumentContext(context);
    await use(context);
  },
});

export const { expect } = test;
