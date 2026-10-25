import {
  type BrowserContext,
  test as base,
  type Worker,
} from '@playwright/test';

import {
  createSharedBackgroundSW,
  getExtensionId,
  withTempProfileContext,
} from './base-fixture';

/** A disposable copy of the SDK session cached by auth setup. */
export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
  extensionId: string;
}>({
  async context({}, use) {
    await withTempProfileContext({ seedFromCachedProfile: true }, use);
  },
  async backgroundSW({ context }, use) {
    await use(await createSharedBackgroundSW(context));
  },
  async extensionId({ backgroundSW }, use) {
    await use(await getExtensionId(backgroundSW));
  },
});

export const { expect } = test;
