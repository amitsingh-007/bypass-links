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
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { TEST_AUTH_DATA_KEY } from '@/constants';
import {
  FirebaseProfileStateSchema,
  TestAuthCredentialsSchema,
} from '@/interfaces/firebase';

interface State {
  idpAuth: Pick<User, 'uid' | 'displayName' | 'photoURL'> | null;
  isSignedIn: boolean;
  authError: boolean;
  isAuthReady: boolean;
  firebaseSignIn: () => Promise<void>;
  firebaseSignOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const auth = getAuth(
  initializeApp(getFirebasePublicConfig(import.meta.env.PROD))
);

// The SDK can refresh concurrent reads separately; share the pending read per user.
let tokenRequest: { user: User; promise: Promise<string> } | undefined;

const useFirebaseStore = create<State>()(
  persist(
    (): State => ({
      idpAuth: null,
      isSignedIn: false,
      authError: false,
      isAuthReady: false,

      async firebaseSignIn() {
        await firebaseAuthReady;
        const testAuthData = localStorage.getItem(TEST_AUTH_DATA_KEY);
        if (testAuthData) {
          const { email, password } = TestAuthCredentialsSchema.parse(
            JSON.parse(testAuthData)
          );
          localStorage.removeItem(TEST_AUTH_DATA_KEY);
          await signInWithEmailAndPassword(auth, email, password);
          return;
        }
        const { token } = await browser.identity.getAuthToken({
          interactive: true,
        });
        if (!token) {
          throw new Error('Google did not return an access token');
        }
        await signInWithCredential(
          auth,
          GoogleAuthProvider.credential(null, token)
        );
      },

      async firebaseSignOut() {
        await firebaseAuthReady;
        tokenRequest = undefined;
        await signOut(auth);
        await browser.identity.clearAllCachedAuthTokens();
      },

      async getIdToken() {
        await firebaseAuthReady;
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
    }),
    {
      name: 'firebase-profile',
      partialize: ({ idpAuth }) => ({ idpAuth }),
      merge: (persisted, current) => {
        const parsed = FirebaseProfileStateSchema.safeParse(persisted);
        const idpAuth = parsed.success ? parsed.data.idpAuth : null;
        return { ...current, idpAuth, isSignedIn: Boolean(idpAuth) };
      },
    }
  )
);

const updateUser = (user: User | null) => {
  useFirebaseStore.setState({
    isSignedIn: Boolean(user),
    idpAuth: user
      ? {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }
      : null,
  });
};

export const firebaseAuthReady = (async () => {
  await auth.authStateReady();
  const savedProfile = useFirebaseStore.getState().idpAuth;
  if (savedProfile && savedProfile.uid !== auth.currentUser?.uid) {
    throw new Error('The saved Firebase session could not be restored');
  }
  updateUser(auth.currentUser);
  onIdTokenChanged(auth, updateUser);
  useFirebaseStore.setState({ isAuthReady: true });
})();

void firebaseAuthReady.catch(() => {
  useFirebaseStore.setState({ authError: true, isAuthReady: true });
});

export default useFirebaseStore;
