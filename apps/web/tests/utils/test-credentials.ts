import process from 'node:process';

import { type BrowserContext } from '@playwright/test';

import { TEST_CREDENTIALS_KEY } from '../../src/app/constants';

/** Makes the web app's Login button use email/password against the test account. */
export const useTestCredentials = async (context: BrowserContext) => {
  await context.addInitScript(
    ({ credentialsJson, key }) => {
      window.localStorage.setItem(key, credentialsJson);
    },
    {
      credentialsJson: JSON.stringify({
        email: process.env.FIREBASE_TEST_USER_EMAIL,
        password: process.env.FIREBASE_TEST_USER_PASSWORD,
      }),
      key: TEST_CREDENTIALS_KEY,
    }
  );
};
