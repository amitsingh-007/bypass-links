import {
  SIGN_IN_TOTAL_STEPS,
  SIGN_OUT_TOTAL_STEPS,
} from '../constants/progress';
import { processPostLogin, processPostLogout, processPreLogout } from './sync';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useProgressStore from '@/store/progress';

const userSignIn = async () => {
  const { firebaseSignIn } = useFirebaseStore.getState();
  await firebaseSignIn();
};

export const signOut = async (): Promise<boolean> => {
  const { firebaseSignOut } = useFirebaseStore.getState();
  const { incrementProgress } = useProgressStore.getState();

  try {
    await processPreLogout();
    await firebaseSignOut();
    incrementProgress(SIGN_OUT_TOTAL_STEPS);
    await processPostLogout();
    return true;
  } catch (error) {
    console.error('Error occurred while signing out.', error);
    return false;
  }
};

export const signIn = async (): Promise<boolean> => {
  const { incrementProgress } = useProgressStore.getState();

  try {
    await userSignIn();
    incrementProgress(SIGN_IN_TOTAL_STEPS);
    await processPostLogin();
    return true;
  } catch (error) {
    console.error('Error occurred while signing in.', error);
    console.log('Reverting due to login error...');
    await signOut();
    return false;
  }
};
