/* eslint-disable react-hooks/rules-of-hooks */
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { getFirebasePublicConfig } from '../../../../packages/configs/firebase.config';
import { GLOBALS } from '../../../../packages/shared/src/constants/globals';
import { env } from '../../../../packages/trpc/src/constants/env';
import { test as base } from './extension-fixture';
import { type IAuthResponse } from '@/interfaces/firebase';
import { getExpiresAtMs } from '@/store/firebase/utils';

const firebaseConfig = getFirebasePublicConfig(GLOBALS.PROD_ENV);
const identityApi = wretch('https://identitytoolkit.googleapis.com/v1')
  .addon(QueryStringAddon)
  .query({
    key: firebaseConfig.apiKey,
  });

const signInWithEmailAndPassword = async (): Promise<IAuthResponse> => {
  return identityApi
    .url('/accounts:signInWithPassword')
    .post({
      email: env.FIREBASE_TEST_USER_EMAIL,
      password: env.FIREBASE_TEST_USER_PASSWORD,
      returnSecureToken: true,
    })
    .json<IAuthResponse>((res) => ({
      uid: res.localId,
      email: res.email,
      fullName: res.displayName,
      photoUrl: '',
      displayName: res.displayName,
      idToken: res.idToken,
      expiresIn: Number(res.expiresIn),
      expiresAtMs: getExpiresAtMs(res.expiresIn),
      refreshToken: res.refreshToken,
    }));
};

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

    await context.addInitScript((authDataJson: string) => {
      window.localStorage.setItem('__test_auth_data', authDataJson);
    }, JSON.stringify(authData));

    await use();
  },
});

export const { expect } = test;
