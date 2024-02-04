import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';
import { User, deleteUser, getAuth, signInAnonymously } from 'firebase/auth';

const firebaseApp = initializeApp(getFirebasePublicConfig(PROD_ENV));
const auth = getAuth(firebaseApp);

export const anonymousSignIn = () => signInAnonymously(auth);

export const deleteFirebaseUser = (user: User) => deleteUser(user);

export const getUser = () => auth.currentUser;

export type { User as FirebaseUser } from 'firebase/auth';
