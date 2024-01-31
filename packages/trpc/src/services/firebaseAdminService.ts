import {
  getFirebasePublicConfig,
  getFullDbPath,
  IFirebaseDbRef,
  IFirebaseDbRootKeys,
} from '@bypass/shared';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getEnv } from '../constants/env';

interface Firebase {
  ref: IFirebaseDbRef | IFirebaseDbRootKeys;
  uid?: string;
  isAbsolute?: boolean;
  data: any;
}

/**
 * We split the credentials json that we get from firebase admin because:
 * Vercel stringifies the json and JSON.parse fails on the private key.
 *
 * SERVICE_ACCOUNT_KEY: contains the credentials json except the private_key
 * FIREBASE_PRIVATE_KEY: contains the private key
 */
const { SERVICE_ACCOUNT_KEY, FIREBASE_PRIVATE_KEY } = getEnv();

const firebasePublicConfig = getFirebasePublicConfig();

const getFirebaseCredentials = () => {
  const serviceAccountKey = JSON.parse(SERVICE_ACCOUNT_KEY);
  return cert({
    ...serviceAccountKey,
    private_key: FIREBASE_PRIVATE_KEY,
  });
};

const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: getFirebaseCredentials(),
        databaseURL: firebasePublicConfig.databaseURL,
      });

const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

/**
 * REALTIME DATABASE
 */
export const getFromFirebase = async <T extends Record<string, any>>({
  ref,
  uid,
  isAbsolute,
}: Omit<Firebase, 'data'>): Promise<T> => {
  const dbPath = getFullDbPath(ref, uid, isAbsolute);
  const snapshot = await database.ref(dbPath).once('value');
  return snapshot.val() || {};
};

export const saveToFirebase = async ({
  ref,
  uid,
  data,
  isAbsolute,
}: Firebase) => {
  try {
    await database.ref(getFullDbPath(ref, uid, isAbsolute)).set(data);
    return true;
  } catch (err) {
    console.log(`Error while saving data to Firebase DB: ${ref}`, err);
    return false;
  }
};

export const removeFromFirebase = async ({
  ref,
  uid,
  isAbsolute,
}: Omit<Firebase, 'data'>) =>
  database.ref(getFullDbPath(ref, uid, isAbsolute)).remove();

/**
 * AUTH
 */
export const getFirebaseUser = (uid: string) => auth.getUser(uid);

export const verifyAuthToken = (idToken: string, checkRevoked?: boolean) =>
  auth.verifyIdToken(idToken, checkRevoked);
