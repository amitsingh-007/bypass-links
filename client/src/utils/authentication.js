import identity from "ChromeApi/identity";
import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { googleSignIn, googleSignOut } from "./firebase";
import {
  processPostLogin,
  processPostLogout,
  syncFirebaseToStorage,
  syncStorageToFirebase,
} from "./sync";

const syncAuthenticationToStorage = async ({
  userProfile,
  googleAuthToken,
}) => {
  await storage.set({
    [STORAGE_KEYS.isSignedIn]: true,
    [STORAGE_KEYS.userProfile]: userProfile,
    [STORAGE_KEYS.googleAuthToken]: googleAuthToken,
  });
};

export const resetAuthentication = async () => {
  const { [STORAGE_KEYS.googleAuthToken]: googleAuthToken } = await storage.get(
    STORAGE_KEYS.googleAuthToken
  );
  await identity.removeCachedAuthToken({ token: googleAuthToken });
  console.log("Removed Google auth token from cache");
  await storage.remove([
    STORAGE_KEYS.isSignedIn,
    STORAGE_KEYS.userProfile,
    STORAGE_KEYS.googleAuthToken,
  ]);
};

export const signIn = async () => {
  try {
    const googleAuthToken = await identity.getAuthToken({ interactive: true });
    const response = await googleSignIn(googleAuthToken);
    //First process authentication
    await syncAuthenticationToStorage({
      userProfile: response.additionalUserInfo.profile,
      googleAuthToken,
    });
    //Then sync remote firebase to storage
    await syncFirebaseToStorage();
    //Then do post processing
    await processPostLogin();
    console.log("Login Success ", response);
    return true;
  } catch (err) {
    console.error("Error occured while signing in. ", err);
    console.log("Reverting due to login error...");
    await processPostLogout();
    return false;
  }
};

export const signOut = async () => {
  try {
    //First sync storage to firebase
    await syncStorageToFirebase();
    //Then signout
    await googleSignOut();
    //Finally do post logout processing
    await processPostLogout();

    console.log("Logout Success");
    return true;
  } catch (err) {
    console.error("Error occured while signing out. ", err);
    return false;
  }
};
