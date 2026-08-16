import type { Buffer } from 'node:buffer';

import { IS_PROD } from '@bypass/configs/env';
import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { TRPCError } from '@trpc/server';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import pLimit from 'p-limit';
import { z } from 'zod/mini';

import { env } from '../constants/env';
import { type EFirebaseDBRef } from '../constants/firebase';
import { getFullDbPath, getFilePath, getBucketPath } from '../utils/firebase';

interface Firebase {
  ref: EFirebaseDBRef;
  uid: string;
  data: object;
}

const firebasePublicConfig = getFirebasePublicConfig(IS_PROD);

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

/**
 * REALTIME DATABASE
 */
/** Returns null when empty; callers supply their own schema-appropriate default. */
export const getFromFirebase = async <T = any>({
  ref,
  uid,
}: Omit<Firebase, 'data'>): Promise<T | null> => {
  const dbPath = getFullDbPath(ref, uid);
  const snapshot = await database.ref(dbPath).once('value');
  return snapshot.val() ?? null;
};

/**
 * Rejects rather than returning a flag, so the real cause reaches the tRPC
 * error channel instead of every caller re-inventing a throw from `false`.
 */
const writeToFirebase = async (
  operation: 'set' | 'update',
  { ref, uid, data }: Firebase
) => {
  try {
    await database.ref(getFullDbPath(ref, uid))[operation](data);
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Error while writing data to Firebase DB: ${ref}`,
      cause: error,
    });
  }
};

/** Replaces the entire object at the path. */
export const saveToFirebase = async (params: Firebase) =>
  writeToFirebase('set', params);

/**
 * Merges into the object at the path:
 * - Provided keys are updated with new values
 * - New keys that don't exist are inserted (upsert)
 * - Existing keys not provided remain unchanged
 */
export const upsertToFirebase = async (params: Firebase) =>
  writeToFirebase('update', params);

/**
 * AUTH
 */
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

/**
 * Resolves many names in one request. `getDownloadURL` is still a metadata call
 * per file, so this collapses the client round trips, not the GCS ones — hence
 * the concurrency cap. A file with no url is omitted rather than failing the
 * batch, since a person may legitimately have no avatar yet.
 */
export const getFilesFromFirebase = async (
  uid: string,
  fileNames: string[]
) => {
  const limit = pLimit(20);
  const entries = await Promise.all(
    fileNames.map(async (fileName) =>
      limit(async () => {
        try {
          const fileRef = storage.bucket().file(getFilePath(uid, fileName));
          return [fileName, await getDownloadURL(fileRef)] as const;
        } catch (error) {
          console.error(
            `Could not resolve download url for ${fileName}`,
            error
          );
          return null;
        }
      })
    )
  );
  return Object.fromEntries(entries.filter((entry) => entry !== null));
};
