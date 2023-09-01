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
export const getFromFirebase = async ({
  ref,
  uid,
  isAbsolute,
}: Omit<Firebase, 'data'>) =>
  database.ref(getFullDbPath(ref, uid, isAbsolute)).once('value');

export const saveToFirebase = async ({
  ref,
  uid,
  data,
  isAbsolute,
}: Firebase) => database.ref(getFullDbPath(ref, uid, isAbsolute)).set(data);

export const removeFromFirebase = async ({
  ref,
  uid,
  isAbsolute,
}: Omit<Firebase, 'data'>) =>
  database.ref(getFullDbPath(ref, uid, isAbsolute)).remove();

export const getUser = (uid: string) => auth.getUser(uid);
