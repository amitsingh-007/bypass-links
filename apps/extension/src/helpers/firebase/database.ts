import { getFullDbPath } from '@bypass/shared';
import { get, getDatabase, ref, set } from 'firebase/database';
import firebaseApp from '.';
import { getUserProfile } from '../fetchFromStorage';

const getDbRef = async (ref: string) => {
  const userProfile = await getUserProfile();
  return getFullDbPath(ref, userProfile.uid);
};

const db = getDatabase(firebaseApp);

export const getFromFirebase = async <T>(path: string) => {
  const dbRef = ref(db, await getDbRef(path));
  const snapshot = await get(dbRef);
  return (snapshot.val() || {}) as T;
};

export const saveToFirebase = async (path: string, data: any) => {
  try {
    const dbRef = ref(db, await getDbRef(path));
    await set(dbRef, data);
    return true;
  } catch (err) {
    console.log(`Error while saving data to Firebase db: ${ref}`, err);
    return false;
  }
};
