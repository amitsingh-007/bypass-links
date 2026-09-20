import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { TEST_AUTH_DATA_KEY } from '@/constants';
import { AuthResponseSchema, type IAuthResponse } from '@/interfaces/firebase';
import { refreshIdToken, signInWithCredential } from '@/store/firebase/api';
import { getExpiresAtMs } from '@/store/firebase/utils';

interface State {
  idpAuth: IAuthResponse | null;
  isSignedIn: boolean;

  firebaseSignIn: () => Promise<void>;
  firebaseSignOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const FIVE_MINS_MS = 5 * 60 * 1000;

const useFirebaseStore = create<State>()(
  persist(
    (set, get) => {
      const setIdpAuth = (idpAuth: IAuthResponse | null) =>
        set({ idpAuth, isSignedIn: Boolean(idpAuth) });

      return {
        idpAuth: null,
        isSignedIn: false,

        async firebaseSignIn() {
          const testAuthData = localStorage.getItem(TEST_AUTH_DATA_KEY);
          if (testAuthData) {
            const idpAuth = AuthResponseSchema.parse(JSON.parse(testAuthData));
            localStorage.removeItem(TEST_AUTH_DATA_KEY);
            setIdpAuth(idpAuth);
            return;
          }

          const { token: accessToken } = await browser.identity.getAuthToken({
            interactive: true,
          });

          if (!accessToken) {
            return;
          }
          const idpAuthRes = await signInWithCredential(accessToken);
          if (!idpAuthRes) {
            console.error(
              'Firebase sign-in failed: signInWithCredential returned no response'
            );
            return;
          }
          setIdpAuth(idpAuthRes);
        },

        async firebaseSignOut() {
          setIdpAuth(null);
          await browser.identity.clearAllCachedAuthTokens();
        },

        async getIdToken() {
          const { idpAuth } = get();
          if (!idpAuth) {
            return null;
          }

          const expiresAt = idpAuth.expiresAtMs;
          const curTimeMs = Date.now();
          if (expiresAt - curTimeMs > FIVE_MINS_MS) {
            return idpAuth.idToken;
          }
          const refreshedTokenData = await refreshIdToken(idpAuth.refreshToken);
          if (!refreshedTokenData) {
            console.error(
              'Firebase token refresh failed: refreshIdToken returned no response'
            );
            return null;
          }
          const { expiresIn, ...refreshed } = refreshedTokenData;
          const newIdpAuth: IAuthResponse = {
            ...idpAuth,
            ...refreshed,
            expiresAtMs: getExpiresAtMs(expiresIn),
          };
          setIdpAuth(newIdpAuth);
          return newIdpAuth.idToken;
        },
      };
    },
    {
      name: '__fbOAuth',
      partialize: ({ idpAuth, isSignedIn }) => ({ idpAuth, isSignedIn }),
    }
  )
);

export default useFirebaseStore;
