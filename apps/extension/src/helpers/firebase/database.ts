import { getFullDbPath, IFirebaseDbRef } from '@bypass/shared';
import { get, getDatabase, ref, set } from 'firebase/database';
import firebaseApp from '.';
import { getUserProfile } from '../fetchFromStorage';

const getDbRef = async (_ref: string) => {
  const userProfile = await getUserProfile();
  return getFullDbPath(_ref, userProfile.uid);
};

const db = getDatabase(firebaseApp);

export const getFromFirebase = async <T>(path: IFirebaseDbRef) => {
  const dbRef = ref(db, await getDbRef(path));
  const snapshot = await get(dbRef);
  return (snapshot.val() || {}) as T;
};

export const saveToFirebase = async (path: IFirebaseDbRef, data: any) => {
  try {
    const dbRef = ref(db, await getDbRef(path));
    await set(dbRef, data);
    return true;
  } catch (err) {
    console.log(`Error while saving data to Firebase db: ${ref}`, err);
    return false;
  }
};
