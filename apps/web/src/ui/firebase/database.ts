import { getFullDbPath } from '@bypass/shared/utils/firebase';
import { User } from 'firebase/auth';
import { get, getDatabase, ref } from 'firebase/database';
import firebaseApp from '.';

const getDbRef = async (ref: string, user: User) => {
  return getFullDbPath(ref, user.uid);
};

const db = getDatabase(firebaseApp);

export const getFromFirebase = async <T>(path: string, user: User | null) => {
  if (!user) {
    throw new Error('User not found');
  }
  const dbRef = ref(db, await getDbRef(path, user));
  const snapshot = await get(dbRef);
  return (snapshot.val() || {}) as T;
};
