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

    await context.addInitScript(
      ({ localStorageData }) => {
        for (const [key, value] of Object.entries(localStorageData)) {
          window.localStorage.setItem(key, value);
        }
        window.localStorage.removeItem('OUTDATED_EXT_CHECK');
      },
      { localStorageData: cachedData.localStorage }
    );

    await use();
  },
});

export const { expect } = test;
