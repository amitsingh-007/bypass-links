import filenamify from 'filenamify';

import { DB_ROOT, type EFirebaseDBRef } from '../constants/firebase';

export const getFullDbPath = (ref: EFirebaseDBRef, uid: string) =>
  `/${DB_ROOT}/${uid}/${ref}`;

export const getBucketPath = (uid: string) => `${uid}/persons`;

export const getFilePath = (uid: string, fileName: string) => {
  const trimmed = fileName.trim();
  const sanitized = filenamify(trimmed);

  // Validate that sanitization produced a non-empty result
  if (!sanitized) {
    throw new Error(
      'Invalid filename: filename cannot be empty or contain only invalid characters'
    );
  }

  return `${getBucketPath(uid)}/${sanitized}`;
};
