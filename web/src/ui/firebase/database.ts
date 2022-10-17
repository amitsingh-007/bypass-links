import { getFullDbPath } from '@common/utils/firebase';
import { User } from 'firebase/auth';
import { get, getDatabase, onValue, ref } from 'firebase/database';
import firebaseApp from '.';

const getDbRef = async (ref: string, user: User) => {
  return getFullDbPath(ref, user.uid);
};

const db = getDatabase(firebaseApp);

export const getFromFirebase = async <T>(path: string, user: User | null) => {
  console.log('db 1', path);
  if (!user) {
    console.log('db 2', path);
    throw new Error('User not found');
  }
  console.log('db 3', path);
  const dbRef = ref(db, await getDbRef(path, user));
  onValue(
    dbRef,
    (snapshot) => {
      console.log('SNAP: ' + snapshot.val());
    },
    (error) => {
      console.error(error);
      console.log(error);
    }
  );
  console.log('db 4', dbRef);
  const snapshot = await get(dbRef);
  console.log('snapshot', snapshot.val());
  return (snapshot.val() || {}) as T;
};
