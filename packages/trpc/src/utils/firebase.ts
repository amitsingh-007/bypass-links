import { EFirebaseDBRootKeys } from '../constants/firebase';

export const getFullDbPath = (
  ref: string,
  uid?: string,
  isAbsolute = false
) => {
  if (isAbsolute) {
    return ref;
  }
  return `/${EFirebaseDBRootKeys.data}/${uid}/${ref}`;
};

export const getFilePath = (uid: string, fileName: string) =>
  `${uid}/persons/${fileName}`;
