/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from './extension-fixture';
import { loadCachedStorageData } from './base-fixture';

export const test = base.extend<{
  login: void;
  extensionId: string;
}>({
  async extensionId({ backgroundSW }, use) {
    const url = backgroundSW.url();
    const id = url.split('/')[2];
    await use(id);
  },
  async login({ context }, use) {
    const cachedData = await loadCachedStorageData();

    await context.addInitScript(
      ({ localStorageData }) => {
        for (const [key, value] of Object.entries(localStorageData)) {
          window.localStorage.setItem(key, value);
        }
        window.localStorage.removeItem('__outdatedCheck');
      },
      { localStorageData: cachedData.localStorage }
    );

    await use();
  },
});

export const { expect } = test;
