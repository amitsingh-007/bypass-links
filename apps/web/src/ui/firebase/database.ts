import { getFullDbPath, IFirebaseDbRef } from '@bypass/shared';
import { User } from 'firebase/auth';
import { get, getDatabase, ref } from 'firebase/database';
import firebaseApp from '.';

const getDbRef = async (_ref: string, user: User) => {
  return getFullDbPath(_ref, user.uid);
};

const db = getDatabase(firebaseApp);

export const getFromFirebase = async <T>(
  path: IFirebaseDbRef,
  user: User | null
): Promise<T> => {
  if (!user) {
    throw new Error('User not found');
  }
  const dbRef = ref(db, await getDbRef(path, user));
  const snapshot = await get(dbRef);
  return snapshot.val() || {};
};
