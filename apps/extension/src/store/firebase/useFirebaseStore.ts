import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { TEST_AUTH_DATA_KEY } from '@/constants';
import { type IAuthResponse } from '@/interfaces/firebase';
import { refreshIdToken, signInWithCredential } from '@/store/firebase/api';
import { getExpiresAtMs } from '@/store/firebase/utils';

interface State {
  idpAuth: IAuthResponse | null;
  // Kept alongside idpAuth: reads better at the call sites than deriving it
  isSignedIn: boolean;

  setIsSignedIn: (isSignedIn: boolean) => void;
  setIdpAuth: (idpAuth: IAuthResponse) => void;
  resetIdpAuth: VoidFunction;

  firebaseSignIn: () => Promise<void>;
  firebaseSignOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const FIVE_MINS_MS = 5 * 60 * 1000;

const useFirebaseStore = create<State>()(
  persist(
    (set, get) => ({
      idpAuth: null,
      isSignedIn: false,

      setIsSignedIn: (isSignedIn: boolean) => set(() => ({ isSignedIn })),
      setIdpAuth: (idpAuth: IAuthResponse) => set(() => ({ idpAuth })),
      resetIdpAuth: () => set(() => ({ idpAuth: null })),

      async firebaseSignIn() {
        const { setIdpAuth } = get();

        const testAuthData = localStorage.getItem(TEST_AUTH_DATA_KEY);
        if (testAuthData) {
          localStorage.removeItem(TEST_AUTH_DATA_KEY);
          const authData = JSON.parse(testAuthData) as IAuthResponse;
          setIdpAuth(authData);
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
        const { resetIdpAuth } = get();
        resetIdpAuth();
        await browser.identity.clearAllCachedAuthTokens();
      },

      async getIdToken() {
        const { idpAuth, setIdpAuth } = get();
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
    }),
    {
      name: '__fbOAuth',
      partialize: (state) => ({ idpAuth: state.idpAuth }),
    }
  )
);

export default useFirebaseStore;
