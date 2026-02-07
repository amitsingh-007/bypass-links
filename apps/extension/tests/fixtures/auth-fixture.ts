/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from './extension-fixture';

export const test = base.extend<{
  extensionId: string;
}>({
  async extensionId({ backgroundSW }, use) {
    const url = backgroundSW.url();
    const id = url.split('/')[2];
    await use(id);
  },
});

export const { expect } = test;
