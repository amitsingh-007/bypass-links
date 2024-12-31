import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { processPostLogin, processPostLogout, processPreLogout } from './sync';
import { nprogress, nprogressStore } from '@mantine/nprogress';
import {
  SIGN_IN_TOTAL_STEPS,
  SIGN_OUT_TOTAL_STEPS,
} from '../constants/progress';

const userSignIn = async () => {
  const { firebaseSignIn } = useFirebaseStore.getState();
  await firebaseSignIn();
  nprogress.increment();
};

export const signOut = async (): Promise<boolean> => {
  const { firebaseSignOut } = useFirebaseStore.getState();

  try {
    await processPreLogout();
    await firebaseSignOut();
    nprogress.increment();
    await processPostLogout();
    return true;
  } catch (error) {
    console.error('Error occurred while signing out.', error);
    return false;
  }
};

export const signIn = async (): Promise<boolean> => {
  try {
    await userSignIn();
    await processPostLogin();
    return true;
  } catch (error) {
    console.error('Error occurred while signing in.', error);
    console.log('Reverting due to login error...');
    await signOut();
    return false;
  }
};
