import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import firebaseApp from '.';

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

export const googleSignIn = async () => signInWithPopup(auth, provider);

export const googleSignOut = async () => signOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const getAuthIdToken = async () => auth.currentUser?.getIdToken(true);

export const getCurrentUser = () => auth.currentUser;
