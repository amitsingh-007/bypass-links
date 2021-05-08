import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { googleSignIn, googleSignOut } from "./firebase";
import {
  processPostLogin,
  processPostLogout,
  syncFirebaseToStorage,
  syncStorageToFirebase,
} from "./sync";

export const syncAuthenticationToStorage = async (userProfile) => {
  await storage.set({
    [STORAGE_KEYS.isSignedIn]: true,
    [STORAGE_KEYS.userProfile]: userProfile,
  });
};

export const resetAuthentication = async () => {
  await storage.remove([STORAGE_KEYS.isSignedIn, STORAGE_KEYS.userProfile]);
};

export const signIn = async () => {
  try {
    const response = await googleSignIn();
    //First sync remote firebase to storage
    await syncFirebaseToStorage(response.additionalUserInfo.profile);
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
