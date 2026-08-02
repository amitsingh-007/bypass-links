import { FirebaseError } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';

import firebaseApp from '.';

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

// Popup first per Firebase best-practices. Blocked popups (iOS Safari default,
// desktop blockers) fall back to redirect, which needs no popup permission and
// works via the same-origin /__/auth proxy on prod.
export const googleSignIn = async (): Promise<void> => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
};

export const getGoogleRedirectResult = async () => getRedirectResult(auth);

export const googleSignOut = async () => signOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// No force-refresh: this runs before every tRPC request and the SDK already
// refreshes within 5 mins of expiry, so forcing it added a securetoken round
// trip to each call
export const getAuthIdToken = async () => auth.currentUser?.getIdToken();

export const emailAndPasswordSignIn = async (
  email: string,
  password: string
) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};
