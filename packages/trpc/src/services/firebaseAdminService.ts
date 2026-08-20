import type { Buffer } from 'node:buffer';

import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { z } from 'zod/mini';

import { env } from '../constants/env';
import { type EFirebaseDBRef } from '../constants/firebase';
import { getFullDbPath, getFilePath, getBucketPath } from '../utils/firebase';

interface Firebase {
  ref: EFirebaseDBRef;
  uid?: string;
  data: object;
}

const firebasePublicConfig = getFirebasePublicConfig(
  process.env.NODE_ENV === 'production'
);

const serviceAccountSchema = z.object({
  project_id: z.string(),
  private_key: z.string(),
  client_email: z.string(),
});

const getServiceAccountCredential = () => {
  const account = serviceAccountSchema.parse(
    JSON.parse(atob(env.FIREBASE_SERVICE_ACCOUNT))
  );

  return cert({
    projectId: account.project_id,
    privateKey: account.private_key,
    clientEmail: account.client_email,
  });
};

const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: getServiceAccountCredential(),
        databaseURL: firebasePublicConfig.databaseURL,
        storageBucket: firebasePublicConfig.storageBucket,
      });

const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

/** Returns null when empty; callers supply their own schema-appropriate default. */
export const getFromFirebase = async <T = any>({
  ref,
  uid,
}: Omit<Firebase, 'data'>): Promise<T | null> => {
  const dbPath = getFullDbPath(ref, uid);
  const snapshot = await database.ref(dbPath).once('value');
  return snapshot.val() ?? null;
};

export const saveToFirebase = async ({ ref, uid, data }: Firebase) => {
  await database.ref(getFullDbPath(ref, uid)).set(data);
};

/** `.update()`: merges the given keys, inserts missing ones, leaves the rest. */
export const upsertToFirebase = async ({ ref, uid, data }: Firebase) => {
  await database.ref(getFullDbPath(ref, uid)).update(data);
};

export const verifyAuthToken = async (
  idToken: string,
  checkRevoked?: boolean
) => auth.verifyIdToken(idToken, checkRevoked);

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
  try {
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeFileFromFirebase = async (uid: string, fileName: string) => {
  await storage.bucket().file(getFilePath(uid, fileName)).delete();
};

export const listFilesFromFirebase = async (uid: string) => {
  const [files] = await storage
    .bucket()
    .getFiles({ prefix: getBucketPath(uid) });

  return files;
};
