import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { getFirebasePublicConfig } from '../../../../packages/configs/firebase.config';
import type { IAuthResponse } from '@/interfaces/firebase';
import { getExpiresAtMs } from '@/store/firebase/utils';

const ciBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;
const isCI = Boolean(ciBaseUrl);
const firebaseConfig = getFirebasePublicConfig(isCI);

const identityApi = wretch('https://identitytoolkit.googleapis.com/v1')
  .addon(QueryStringAddon)
  .query({
    key: firebaseConfig.apiKey,
  });

export const signInWithEmailAndPassword = async (): Promise<IAuthResponse> => {
  return identityApi
    .url('/accounts:signInWithPassword')
    .post({
      email: process.env.FIREBASE_TEST_USER_EMAIL,
      password: process.env.FIREBASE_TEST_USER_PASSWORD,
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
