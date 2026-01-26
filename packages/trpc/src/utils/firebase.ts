import filenamify from 'filenamify';
import { EFirebaseDBRootKeys } from '../constants/firebase';

export const getFullDbPath = (ref: string, uid?: string) => {
  return `/${EFirebaseDBRootKeys.data}/${uid}/${ref}`;
};

export const getBucketPath = (uid: string) => `${uid}/persons`;

export const getFilePath = (uid: string, fileName: string) => {
  const sanitized = filenamify(fileName);
  return `${getBucketPath(uid)}/${sanitized}`;
};
