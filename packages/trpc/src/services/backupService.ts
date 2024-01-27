import { FIREBASE_DB_ROOT_KEYS } from '@bypass/shared';
import { getFromFirebase, saveToFirebase } from './firebaseAdminService';

export const backupData = async () => {
  const snapshot = await getFromFirebase({
    ref: FIREBASE_DB_ROOT_KEYS.data,
    isAbsolute: true,
  });
  await saveToFirebase({
    ref: FIREBASE_DB_ROOT_KEYS.backup,
    data: snapshot.val(),
    isAbsolute: true,
  });
};
