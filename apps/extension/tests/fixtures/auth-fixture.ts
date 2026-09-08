import { injectLocalStorage } from '@bypass/shared/tests';
import {
  type BrowserContext,
  test as base,
  type Worker,
} from '@playwright/test';

import {
  createSharedBackgroundSW,
  getExtensionId,
  loadCachedStorageData,
  withTempProfileContext,
} from './base-fixture';

/** A fresh, unseeded profile per test; `login` injects the cached auth state into it. */
export const test = base.extend<{
  context: BrowserContext;
  backgroundSW: Worker;
  extensionId: string;
  login: void;
}>({
  async context({}, use) {
    await withTempProfileContext({}, use);
  },
  async backgroundSW({ context }, use) {
    await use(await createSharedBackgroundSW(context));
  },
  async extensionId({ backgroundSW }, use) {
    await use(await getExtensionId(backgroundSW));
  },
  async login({ context }, use) {
    const cachedData = await loadCachedStorageData();
    await injectLocalStorage(context, cachedData.localStorage);
    await use();
  },
});

export const { expect } = test;
