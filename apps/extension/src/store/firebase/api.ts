import { IAuthResponse, IRefreshTokenResponse } from '@/interfaces/firebase';
import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { getExpiresAtMs } from './utils';

const firebaseConfig = getFirebasePublicConfig(PROD_ENV);

const identityApi = wretch('https://identitytoolkit.googleapis.com/v1')
  .addon(QueryStringAddon)
  .query({ key: firebaseConfig.apiKey });

const secureTokenApi = wretch('https://securetoken.googleapis.com/v1')
  .addon(QueryStringAddon)
  .query({ key: firebaseConfig.apiKey });

export const signInWithCredential = async (accessToken: string) => {
  return identityApi
    .url('/accounts:signInWithIdp')
    .post({
      postBody: `access_token=${accessToken}&providerId=google.com`,
      requestUri: new URL(HOST_NAME).origin,
      returnSecureToken: true,
    })
    .fetchError((e) => console.error(e))
    .json<IAuthResponse>((res) => ({
      uid: res.localId,
      email: res.email,
      fullName: res.displayName,
      photoUrl: res.photoUrl,
      displayName: res.displayName,
      idToken: res.idToken,
      expiresIn: res.expiresIn,
      expiresAtMs: getExpiresAtMs(res.expiresIn),
      refreshToken: res.refreshToken,
    }));
};

export const refreshIdToken = async (refreshToken: string) => {
  return secureTokenApi
    .url('/token')
    .post({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
    .fetchError((e) => console.error(e))
    .json<IRefreshTokenResponse>((res) => ({
      expiresIn: res.expires_in,
      idToken: res.id_token,
      refreshToken: res.refresh_token,
    }));
};
