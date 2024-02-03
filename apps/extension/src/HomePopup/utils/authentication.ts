import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { UserInfo } from '../interfaces/authentication';
import { AuthProgress } from './authProgress';
import { processPostLogin, processPostLogout, processPreLogout } from './sync';

const userSignIn = async (): Promise<UserInfo> => {
  const { firebaseSignIn } = useFirebaseStore.getState();

  AuthProgress.start('Logging in user');
  const response = await firebaseSignIn();
  AuthProgress.finish('User logged in');
  return {
    uid: response.uid,
    name: response.displayName ?? 'No Name',
    picture: response?.photoUrl ?? '',
  };
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
  } catch (err) {
    console.error('Error occurred while signing out.', err);
    return false;
  }
};

export const signIn = async (): Promise<boolean> => {
  try {
    AuthProgress.initialize(7);
    const userProfile = await userSignIn();
    await processPostLogin(userProfile);
    return true;
  } catch (err) {
    console.error('Error occurred while signing in. ', err);
    console.log('Reverting due to login error...');
    await signOut();
    return false;
  }
};
