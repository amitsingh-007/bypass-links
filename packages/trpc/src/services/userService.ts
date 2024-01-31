import { FIREBASE_DB_REF } from '@bypass/shared';
import { User2FAInfo } from '../interfaces/firebase';
import { getFromFirebase } from './firebaseAdminService';

export const fetchUser2FAInfo = async (uid: string) => {
  return getFromFirebase<User2FAInfo>({
    ref: FIREBASE_DB_REF.user2FAInfo,
    uid,
  });
};
