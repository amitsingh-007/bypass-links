import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth/web-extension';
import { z } from 'zod/mini';
import { create } from 'zustand';

import { TEST_AUTH_DATA_KEY } from '@/constants';
import {
  LegacyAuthResponseSchema,
  TestAuthCredentialsSchema,
} from '@/interfaces/firebase';

interface State {
  idpAuth: {
    uid: string;
    email: string | null;
    photoUrl?: string;
    displayName?: string;
  } | null;
  isSignedIn: boolean;
  firebaseSignIn: () => Promise<void>;
  firebaseSignOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const auth = getAuth(
  initializeApp(getFirebasePublicConfig(import.meta.env.PROD))
);

const signInWithGoogle = async (interactive: boolean) => {
  const { token } = await browser.identity.getAuthToken({ interactive });
  if (!token) {
    throw new Error('Google did not return an access token');
  }
  return signInWithCredential(auth, GoogleAuthProvider.credential(null, token));
};

// The SDK can refresh concurrent reads separately; share the pending read per user.
let tokenRequest: { user: User; promise: Promise<string> } | undefined;

const useFirebaseStore = create<State>(() => ({
  idpAuth: null,
  isSignedIn: false,

  async firebaseSignIn() {
    if (import.meta.env.TEST_AUTH_ENABLED) {
      const testAuthData = localStorage.getItem(TEST_AUTH_DATA_KEY);
      if (testAuthData) {
        const { email, password } = TestAuthCredentialsSchema.parse(
          JSON.parse(testAuthData)
        );
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.removeItem(TEST_AUTH_DATA_KEY);
        return;
      }
    }
    await signInWithGoogle(true);
  },

  async firebaseSignOut() {
    tokenRequest = undefined;
    await signOut(auth);
    await browser.identity.clearAllCachedAuthTokens();
  },

  async getIdToken() {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    if (tokenRequest?.user !== user) {
      const promise = user.getIdToken().finally(() => {
        if (tokenRequest?.promise === promise) {
          tokenRequest = undefined;
        }
      });
      tokenRequest = { user, promise };
    }
    return tokenRequest.promise;
  },
}));

const updateUser = (user: User | null) => {
  useFirebaseStore.setState({
    isSignedIn: Boolean(user),
    idpAuth: user
      ? {
          uid: user.uid,
          email: user.email,
          photoUrl: user.photoURL ?? undefined,
          displayName: user.displayName ?? undefined,
        }
      : null,
  });
};

onIdTokenChanged(auth, updateUser);

export const firebaseAuthReady = (async () => {
  await auth.authStateReady();
  // Remove with #4356 once old extension sessions are negligible.
  const legacySession = localStorage.getItem('__fbOAuth');
  if (legacySession) {
    const { state } = z
      .object({
        state: z.object({ idpAuth: z.nullable(LegacyAuthResponseSchema) }),
      })
      .parse(JSON.parse(legacySession));
    if (state.idpAuth) {
      if (!auth.currentUser) {
        await signInWithGoogle(false);
      }
      if (auth.currentUser?.uid !== state.idpAuth.uid) {
        await signOut(auth);
        throw new Error(
          'The restored Google account differs from the saved account'
        );
      }
    }
    localStorage.removeItem('__fbOAuth');
  }
  updateUser(auth.currentUser);
})();

export default useFirebaseStore;
