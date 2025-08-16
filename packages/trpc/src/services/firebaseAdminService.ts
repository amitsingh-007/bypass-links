import type { Buffer } from 'node:buffer';
import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { env } from '../constants/env';
import {
  type EFirebaseDBRef,
  type EFirebaseDBRootKeys,
} from '../constants/firebase';
import { getFullDbPath, getFilePath } from '../utils/firebase';

interface Firebase {
  ref: EFirebaseDBRef | EFirebaseDBRootKeys;
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
const firebasePublicConfig = getFirebasePublicConfig(PROD_ENV);

const getFirebaseCredentials = () => {
  const serviceAccountKey = JSON.parse(atob(env.SERVICE_ACCOUNT_KEY));
  return cert({
    ...serviceAccountKey,
    private_key: env.FIREBASE_PRIVATE_KEY,
  });
};

const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: getFirebaseCredentials(),
        databaseURL: firebasePublicConfig.databaseURL,
        storageBucket: firebasePublicConfig.storageBucket,
      });

const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

/**
 * REALTIME DATABASE
 */
export const getFromFirebase = async <T = any>({
  ref,
  uid,
  isAbsolute,
}: Omit<Firebase, 'data'>): Promise<T> => {
  const dbPath = getFullDbPath(ref, uid, isAbsolute);
  const snapshot = await database.ref(dbPath).once('value');
  return snapshot.val() ?? {};
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
  } catch (error) {
    console.log(`Error while saving data to Firebase DB: ${ref}`, error);
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
export const getFirebaseUser = async (uid: string) => auth.getUser(uid);

export const verifyAuthToken = async (
  idToken: string,
  checkRevoked?: boolean
) => auth.verifyIdToken(idToken, checkRevoked);

/**
 * STORAGE
 */
export const uploadImageToFirebase = async (
  uid: string,
  {
    buffer,
    fileName,
    fileType,
  }: {
    fileName: string;
    buffer: Buffer;
    fileType: string;
  }
) => {
  try {
    await storage
      .bucket()
      .file(getFilePath(uid, fileName))
      .save(buffer, { contentType: fileType });
  } catch (error) {
    console.error(error);
  }
};

export const getFileFromFirebase = async (uid: string, fileName: string) => {
  const fileRef = storage.bucket().file(getFilePath(uid, fileName));
  return getDownloadURL(fileRef);
};

export const removeFileFromFirebase = async (uid: string, fileName: string) => {
  await storage.bucket().file(getFilePath(uid, fileName)).delete();
};
