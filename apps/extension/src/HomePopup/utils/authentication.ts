import { googleSignIn, googleSignOut } from '@helpers/firebase/auth';
import { UserInfo } from '../interfaces/authentication';
import { AuthProgress } from './authProgress';
import { processPostLogin, processPostLogout, processPreLogout } from './sync';

const userSignIn = async (): Promise<UserInfo> => {
  AuthProgress.start('Logging in user');
  await chrome.identity.clearAllCachedAuthTokens();
  const { token: googleAuthToken } = await chrome.identity.getAuthToken({
    interactive: true,
  });
  if (!googleAuthToken) {
    throw new Error('Google auth token not found');
  }
  const response = await googleSignIn(googleAuthToken);
  const userProfile = response.user ?? {};
  const userInfo: UserInfo = {
    googleAuthToken,
    uid: response.user?.uid,
    name: userProfile.displayName ?? 'No Name',
    picture: userProfile.photoURL ?? '',
  };
  console.log('Firebase login response', response);
  console.log('UserInfo', userInfo);
  AuthProgress.finish('User logged in');
  return userInfo;
};

export const signOut = async (): Promise<boolean> => {
  try {
    AuthProgress.initialize(4);
    await processPreLogout();
    AuthProgress.start('Logging out user');
    await googleSignOut();
    AuthProgress.finish('User logged out');
    await processPostLogout();

    console.log('--------------Logout Success--------------');
    return true;
  } catch (err) {
    console.error('Error occurred while signing out. ', err);
    return false;
  }
};

export const signIn = async (): Promise<boolean> => {
  try {
    AuthProgress.initialize(7);
    const userProfile = await userSignIn();
    await processPostLogin(userProfile);
    console.log('--------------Login Success--------------');
    return true;
  } catch (err) {
    console.error('Error occurred while signing in. ', err);
    console.log('Reverting due to login error...');
    await signOut();
    return false;
  }
};
