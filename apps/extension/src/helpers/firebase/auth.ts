import {
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import firebaseApp from '.';

const auth = initializeAuth(firebaseApp, {
  persistence: indexedDBLocalPersistence,
});

export const googleSignIn = async (token: string) =>
  signInWithCredential(auth, GoogleAuthProvider.credential(null, token));

export const googleSignOut = () => signOut(auth);

export const getAuthIdToken = () => auth.currentUser?.getIdToken();
