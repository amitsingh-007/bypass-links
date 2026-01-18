/* eslint-disable react-hooks/rules-of-hooks */
import { TEST_AUTH_DATA_KEY } from '../constants';
import { signInWithEmailAndPassword } from '../utils/auth';
import { test as base } from './extension-fixture';

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
    const authData = await signInWithEmailAndPassword();

    await context.addInitScript(
      ({ authDataJson, key }) => {
        window.localStorage.setItem(key, authDataJson);
      },
      {
        authDataJson: JSON.stringify(authData),
        key: TEST_AUTH_DATA_KEY,
      }
    );

    await use();
  },
});

export const { expect } = test;
