import { EFirebaseDBRootKeys } from '../constants/firebase';
import { getFromFirebase, saveToFirebase } from './firebaseAdminService';

export const backupData = async () => {
  const data = await getFromFirebase({
    ref: EFirebaseDBRootKeys.data,
    isAbsolute: true,
  });
  await saveToFirebase({
    ref: EFirebaseDBRootKeys.backup,
    data,
    isAbsolute: true,
  });
};
