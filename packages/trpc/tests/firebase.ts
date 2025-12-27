import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { env } from '../src/constants/env';

const firebaseApp = initializeApp(
  getFirebasePublicConfig(process.env.NEXT_PUBLIC_PROD_ENV === 'true')
);
const auth = getAuth(firebaseApp);

export const testUserSignIn = async () => {
  return signInWithEmailAndPassword(
    auth,
    env.FIREBASE_TEST_USER_EMAIL,
    env.FIREBASE_TEST_USER_PASSWORD
  );
};

export const getUser = () => auth.currentUser;

export type { User as FirebaseUser } from 'firebase/auth';
