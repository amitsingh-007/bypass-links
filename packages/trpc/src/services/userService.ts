import { EFirebaseDBRef } from '../constants/firebase';
import { type User2FAInfo } from '../interfaces/firebase';
import { getFromFirebase } from './firebaseAdminService';

export const fetchUser2FAInfo = async (uid: string) => {
  return getFromFirebase<User2FAInfo>({
    ref: EFirebaseDBRef.user2FAInfo,
    uid,
  });
};
