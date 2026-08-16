import { toast } from 'sonner';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { runSteps } from '@/store/progress';

import {
  clearCaches,
  openGoogleActivityTabs,
  resetStorage,
  syncFirebaseToStorage,
  syncStorageToFirebase,
  warmCaches,
} from './sync';

const userSignIn = async () => {
  const { firebaseSignIn } = useFirebaseStore.getState();
  await firebaseSignIn();
};

const userSignOut = async () => {
  const { firebaseSignOut } = useFirebaseStore.getState();
  await firebaseSignOut();
};

/** Untoasted, so a failed sign-in reverting through here shows one error. */
const performSignOut = async () =>
  runSteps([
    // Sync to firebase before logout, since it cannot be done after
    syncStorageToFirebase,
    userSignOut,
    resetStorage,
    clearCaches,
    openGoogleActivityTabs,
  ]);

export const signOut = async () => {
  try {
    await performSignOut();
  } catch (error) {
    console.error('Error occurred while signing out.', error);
    toast.error('Error while logging out');
  }
};

export const signIn = async () => {
  try {
    await runSteps([userSignIn, syncFirebaseToStorage, warmCaches]);
  } catch (error) {
    console.error('Error occurred while signing in.', error);
    console.log('Reverting due to login error...');
    try {
      await performSignOut();
    } catch (revertError) {
      console.error('Error occurred while reverting login.', revertError);
    }
    toast.error('Error while logging in');
  }
};
