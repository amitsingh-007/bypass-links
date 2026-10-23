import type { Buffer } from 'node:buffer';

import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { EStorageKey } from '@bypass/shared/server';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { z } from 'zod/mini';

import { getFirebaseServiceAccount } from '../constants/env';
import { getFullDbPath, getFilePath, getBucketPath } from '../utils/firebase';

// Storage keys that are also realtime-db paths; the rest are local-only
type DbRef = Exclude<
  EStorageKey,
  EStorageKey.mappedRedirections | EStorageKey.personImageUrls
>;

interface Firebase {
  ref: DbRef;
  uid: string;
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
    JSON.parse(atob(getFirebaseServiceAccount()))
  );

  return cert({
    projectId: account.project_id,
    privateKey: account.private_key,
    clientEmail: account.client_email,
  });
};

const getFirebaseApp = () =>
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: getServiceAccountCredential(),
        databaseURL: firebasePublicConfig.databaseURL,
        storageBucket: firebasePublicConfig.storageBucket,
      });

/** Firebase yields null for empty refs; fallback keeps callers total. */
export const getFromFirebase = async <T = any>({
  ref,
  uid,
  fallback,
}: Omit<Firebase, 'data'> & { fallback: T }): Promise<T> => {
  const dbPath = getFullDbPath(ref, uid);
  const snapshot = await getDatabase(getFirebaseApp())
    .ref(dbPath)
    .once('value');
  return snapshot.val() ?? fallback;
};

export const saveToFirebase = async ({ ref, uid, data }: Firebase) => {
  await getDatabase(getFirebaseApp()).ref(getFullDbPath(ref, uid)).set(data);
};

/** `.update()`: merges the given keys, inserts missing ones, leaves the rest. */
export const upsertToFirebase = async ({ ref, uid, data }: Firebase) => {
  await getDatabase(getFirebaseApp()).ref(getFullDbPath(ref, uid)).update(data);
};

export const verifyAuthToken = (idToken: string) =>
  getAuth(getFirebaseApp()).verifyIdToken(idToken, true);

export const uploadImageToFirebase = async (
  uid: string,
  {
    buffer,
    fileName,
  }: {
    fileName: string;
    buffer: Buffer;
  }
) => {
  await getStorage(getFirebaseApp())
    .bucket()
    .file(getFilePath(uid, fileName))
    .save(buffer, { contentType: 'image/jpeg' });
};

export const getFileFromFirebase = (uid: string, fileName: string) =>
  getDownloadURL(
    getStorage(getFirebaseApp()).bucket().file(getFilePath(uid, fileName))
  );

export const removeFileFromFirebase = async (uid: string, fileName: string) => {
  await getStorage(getFirebaseApp())
    .bucket()
    .file(getFilePath(uid, fileName))
    .delete();
};

export const listFilesFromFirebase = async (uid: string) => {
  const [files] = await getStorage(getFirebaseApp())
    .bucket()
    .getFiles({ prefix: getBucketPath(uid) });

  return files;
};
