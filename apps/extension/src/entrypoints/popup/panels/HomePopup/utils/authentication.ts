import useFirebaseStore from '@/store/firebase/useFirebaseStore';

import { processPostLogin, processPostLogout, processPreLogout } from './sync';

const userSignIn = async () => {
  const { firebaseSignIn } = useFirebaseStore.getState();
  await firebaseSignIn();
};

export const signOut = async (): Promise<boolean> => {
  const { firebaseSignOut } = useFirebaseStore.getState();

  try {
    await processPreLogout();
    await firebaseSignOut();
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
