import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { AuthProgress } from './authProgress';
import { processPostLogin, processPostLogout, processPreLogout } from './sync';

const userSignIn = async () => {
  const { firebaseSignIn } = useFirebaseStore.getState();

  AuthProgress.start('Logging in user');
  await firebaseSignIn();
  AuthProgress.finish('User logged in');
};

export const signOut = async (): Promise<boolean> => {
  const { firebaseSignOut } = useFirebaseStore.getState();

  try {
    AuthProgress.initialize(4);
    await processPreLogout();
    AuthProgress.start('Logging out user');
    await firebaseSignOut();
    AuthProgress.finish('User logged out');
    await processPostLogout();
    return true;
  } catch (error) {
    console.error('Error occurred while signing out.', error);
    return false;
  }
};

export const signIn = async (): Promise<boolean> => {
  try {
    AuthProgress.initialize(7);
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
