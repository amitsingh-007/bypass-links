import { STORAGE_KEYS } from "GlobalConstants";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import identity from "GlobalHelpers/chrome/identity";
import storage from "GlobalHelpers/chrome/storage";
import { getUserProfile } from "GlobalHelpers/fetchFromStorage";
import { deleteAllCache } from "GlobalUtils/cache";
import {
  resetBypass,
  syncBypassToStorage,
} from "SrcPath/BackgroundScript/bypass";
import {
  resetRedirections,
  syncRedirectionsToStorage,
} from "SrcPath/BackgroundScript/redirect";
import {
  cacheBookmarkFavicons,
  resetBookmarks,
  syncBookmarksFirebaseWithStorage,
  syncBookmarksToStorage,
} from "SrcPath/BookmarksPanel/utils/bookmark";
import {
  resetLastVisited,
  syncLastVisitedToStorage,
} from "SrcPath/HomePopup/utils/lastVisited";
import {
  cachePersonImagesInStorage,
  refreshPersonImageUrlsCache,
  resetPersons,
  syncPersonsFirebaseWithStorage,
  syncPersonsToStorage,
} from "SrcPath/PersonsPanel/utils/sync";
import { status2FA } from "SrcPath/SettingsPanel/apis/twoFactorAuth";
import { UserInfo } from "../interfaces/authentication";
import { dispatchAuthenticationEvent } from "./authentication";
import { AuthProgress } from "./authProgress";

const syncAuthenticationToStorage = async (userProfile: UserInfo) => {
  AuthProgress.start("Checking 2FA status");
  const { is2FAEnabled } = await status2FA(userProfile.uid ?? "");
  userProfile.is2FAEnabled = is2FAEnabled;
  userProfile.isTOTPVerified = false;
  await storage.set({ [STORAGE_KEYS.userProfile]: userProfile });
  AuthProgress.finish("2FA status checked");
};

const resetAuthentication = async () => {
  const userProfile = await getUserProfile();
  if (!userProfile) {
    console.log("User profile not found");
    return;
  }
  await identity.removeCachedAuthToken({
    token: userProfile.googleAuthToken ?? "",
  });
  console.log("Removed Google auth token from cache");
  await storage.remove(STORAGE_KEYS.userProfile);
};

const syncFirebaseToStorage = async () => {
  AuthProgress.start("Syncing storage with firebase");
  await Promise.all([
    syncRedirectionsToStorage(),
    syncBypassToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
    syncPersonsToStorage(),
  ]);
  AuthProgress.finish("Synced storage with firebase");
};

const syncStorageToFirebase = async () => {
  dispatchAuthenticationEvent({
    message: "Syncing firebase with storage",
    progress: 0,
    progressBuffer: 1,
    total: 4,
  });
  await Promise.all([
    syncBookmarksFirebaseWithStorage(),
    syncPersonsFirebaseWithStorage(),
  ]);
  dispatchAuthenticationEvent({
    message: "Synced firebase with storage",
    progress: 1,
    progressBuffer: 1,
    total: 4,
  });
};

const resetStorage = async () => {
  dispatchAuthenticationEvent({
    message: "Resetting storage",
    progress: 2,
    progressBuffer: 3,
    total: 4,
  });
  await Promise.all([
    resetAuthentication(),
    resetRedirections(),
    resetBypass(),
    resetBookmarks(),
    resetLastVisited(),
    resetPersons(),
    refreshPersonImageUrlsCache(),
  ]);
  console.log("Storage reset successful");
  dispatchAuthenticationEvent({
    message: "Storage reset",
    progress: 3,
    progressBuffer: 3,
    total: 4,
  });
};

export const processPostLogin = async (userProfile: UserInfo) => {
  //First process authentication
  await syncAuthenticationToStorage(userProfile);
  //Then sync remote firebase to storage
  await syncFirebaseToStorage();
  //Then do other processes
  try {
    await cachePersonImagesInStorage();
    AuthProgress.start("Caching bookmark favicons");
    await cacheBookmarkFavicons();
    AuthProgress.finish("Cached bookmark favicons");
  } catch (e) {
    AuthProgress.finish("Caching failed");
  }
};

export const processPreLogout = async () => {
  //Sync changes to firebase before logout, cant sync after logout
  await syncStorageToFirebase();
};

export const processPostLogout = async () => {
  //Reset storage
  await resetStorage();
  //Refresh browser cache
  dispatchAuthenticationEvent({
    message: "Clearing cache",
    progress: 3,
    progressBuffer: 4,
    total: 4,
  });
  await deleteAllCache([CACHE_BUCKET_KEYS.favicon, CACHE_BUCKET_KEYS.person]);
  dispatchAuthenticationEvent({
    message: "Cleared cache",
    progress: 4,
    progressBuffer: 4,
    total: 4,
  });
};
