/* eslint-disable import/no-extraneous-dependencies */
import { getFirebasePublicConfig } from '@bypass/shared';
import { initializeApp } from 'firebase/app';
import { User, deleteUser, getAuth, signInAnonymously } from 'firebase/auth';

const firebaseApp = initializeApp(getFirebasePublicConfig());
const auth = getAuth(firebaseApp);

export const anonymousSignIn = () => signInAnonymously(auth);

export const deleteFirebaseUser = (user: User) => deleteUser(user);

export const getUser = () => auth.currentUser;

export type { User as FirebaseUser } from 'firebase/auth';
