import storage from "ChromeApi/storage";
import { googleSignIn, googleSignOut } from "./firebase";
import {
  resetStorage,
  syncFirebaseToStorage,
  syncStorageToFirebase,
} from "./sync";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { deleteAllCache } from "./cache";

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
    console.log("Login Success ", response);
    await syncFirebaseToStorage(response.additionalUserInfo.profile);
    return true;
  } catch (err) {
    console.error("Error occured while signing in. ", err);
    return false;
  }
};

export const signOut = async () => {
  try {
    //First sync storage to firebase
    await syncStorageToFirebase();
    //Then signout
    await googleSignOut();
    // Reset storage only if signout successful
    await resetStorage();
    //Refresh browser cache
    await deleteAllCache([CACHE_BUCKET_KEYS.favicon]);
    console.log("Logout Success");
    return true;
  } catch (err) {
    console.error("Error occured while signing out. ", err);
    return false;
  }
};
