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

// Popups are silently blocked on iOS Safari, so use redirect on mobile.
export const googleSignIn = async (isMobile: boolean): Promise<void> => {
  if (isMobile) {
    await signInWithRedirect(auth, provider);
    return;
  }
  await signInWithPopup(auth, provider);
};

export const getGoogleRedirectResult = async () => getRedirectResult(auth);

export const googleSignOut = async () => signOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const getAuthIdToken = async () => auth.currentUser?.getIdToken(true);

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
