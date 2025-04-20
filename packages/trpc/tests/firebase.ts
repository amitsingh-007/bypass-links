import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getEnv } from '../src/constants/env';

const firebaseApp = initializeApp(getFirebasePublicConfig(PROD_ENV));
const auth = getAuth(firebaseApp);

export const testUserSignIn = async () => {
  const env = getEnv();
  return signInWithEmailAndPassword(
    auth,
    env.FIREBASE_TEST_USER_EMAIL,
    env.FIREBASE_TEST_USER_PASSWORD
  );
};

export const getUser = () => auth.currentUser;

export type { User as FirebaseUser } from 'firebase/auth';
