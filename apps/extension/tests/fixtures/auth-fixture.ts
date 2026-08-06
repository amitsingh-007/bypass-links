import { injectLocalStorage } from '@bypass/shared/tests';

import { getExtensionId, loadCachedStorageData } from './base-fixture';
import { test as base } from './extension-fixture';

export const test = base.extend<{
  login: void;
  extensionId: string;
}>({
  async extensionId({ backgroundSW }, use) {
    await use(await getExtensionId(backgroundSW));
  },
  async login({ context }, use) {
    const cachedData = await loadCachedStorageData();

    await injectLocalStorage(context, cachedData.localStorage, {
      clearKeys: ['OUTDATED_EXT_CHECK'],
    });

    await use();
  },
});

export const { expect } = test;
