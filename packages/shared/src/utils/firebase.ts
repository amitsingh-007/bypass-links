import { ObjectValues } from '../interfaces/utilityTypes';

export const FIREBASE_DB_ROOT_KEYS = {
  data: 'data',
  backup: 'backup',
} as const;

export type IFirebaseDbRootKeys = ObjectValues<typeof FIREBASE_DB_ROOT_KEYS>;

export const getFullDbPath = (
  ref: string,
  uid?: string,
  isAbsolute = false
) => {
  if (isAbsolute) {
    return ref;
  }
  return `/${FIREBASE_DB_ROOT_KEYS.data}/${uid}/${ref}`;
};

export const getStoragePath = async (ref: string, uid: string) => {
  return `${uid}/${ref}`;
};
