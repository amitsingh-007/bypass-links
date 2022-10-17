import { FIREBASE_DB_REF } from '@common/constants/firebase';
import { User } from 'firebase/auth';

const firebaseKeys = {
  base: ['firebase-db'] as const,
  getFromFirebase: (ref: FIREBASE_DB_REF, user: User | null) =>
    [...firebaseKeys.base, ref, user?.uid ?? ''] as const,
};

export default firebaseKeys;
