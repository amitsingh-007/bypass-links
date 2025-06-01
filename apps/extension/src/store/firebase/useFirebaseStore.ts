import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type IAuthResponse } from '@/interfaces/firebase';
import { refreshIdToken, signInWithCredential } from '@/store/firebase/api';
import { getExpiresAtMs } from '@/store/firebase/utils';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';

interface State {
  idpAuth: IAuthResponse | null;
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
        let accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          const { accessToken: _accessToken } = await sendRuntimeMessage({
            key: 'launchAuthFlow',
          });
          accessToken = _accessToken;
        }

        if (!accessToken) {
          return;
        }

        const { setIdpAuth } = get();
        localStorage.removeItem('access_token');
        const idpAuthRes = await signInWithCredential(accessToken);
        setIdpAuth(idpAuthRes);
      },

      async firebaseSignOut() {
        const { resetIdpAuth } = get();
        resetIdpAuth();
        if (IS_CHROME) {
          await chrome.identity.clearAllCachedAuthTokens();
        }
      },

      async getIdToken() {
        const { idpAuth, setIdpAuth } = get();
        if (!idpAuth) {
          return null;
        }

        const expiresAt = Number(idpAuth.expiresAtMs);
        const curTimeMs = Date.now();
        // Return existing id_token if not expired and not expiring in next 5 mins
        if (expiresAt - curTimeMs > FIVE_MINS_MS) {
          return idpAuth.idToken;
        }
        const refreshedTokenData = await refreshIdToken(idpAuth.refreshToken);
        const newIdpAuth: IAuthResponse = {
          ...idpAuth,
          ...refreshedTokenData,
          expiresAtMs: getExpiresAtMs(refreshedTokenData.expiresIn),
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
