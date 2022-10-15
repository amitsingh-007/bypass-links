import {
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import firebaseApp from '.';

const auth = getAuth(firebaseApp);

// setPersistence
// anonymous login
export const googleSignIn = async () =>
  signInWithPopup(auth, new GoogleAuthProvider());

export const googleSignOut = () => signOut(auth);
