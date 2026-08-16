import { toast } from 'sonner';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useProgressStore from '@/store/progress';

import {
  SIGN_IN_TOTAL_STEPS,
  SIGN_OUT_TOTAL_STEPS,
} from '../constants/progress';
import { processPostLogin, processPostLogout, processPreLogout } from './sync';

const userSignIn = async () => {
  const { firebaseSignIn } = useFirebaseStore.getState();
  await firebaseSignIn();
};

/** Untoasted, so a failed sign-in reverting through here shows one error. */
const performSignOut = async () => {
  const { firebaseSignOut } = useFirebaseStore.getState();
  const { incrementProgress } = useProgressStore.getState();

  await processPreLogout();
  await firebaseSignOut();
  incrementProgress(SIGN_OUT_TOTAL_STEPS);
  await processPostLogout();
};

export const signOut = async () => {
  try {
    await performSignOut();
  } catch (error) {
    console.error('Error occurred while signing out.', error);
    toast.error('Error while logging out');
  }
};

export const signIn = async () => {
  const { incrementProgress } = useProgressStore.getState();

  try {
    await userSignIn();
    incrementProgress(SIGN_IN_TOTAL_STEPS);
    await processPostLogin();
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
