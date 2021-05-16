import identity from "ChromeApi/identity";
import storage from "ChromeApi/storage";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { resetBypass, syncBypassToStorage } from "GlobalUtils/bypass/index";
import { deleteAllCache } from "GlobalUtils/cache";
import {
  resetLastVisited,
  syncLastVisitedToStorage,
} from "GlobalUtils/lastVisited";
import {
  resetRedirections,
  syncRedirectionsToStorage,
} from "GlobalUtils/redirect";
import {
  cacheBookmarkFavicons,
  resetBookmarks,
  syncBookmarksFirebaseWithStorage,
  syncBookmarksToStorage,
} from "SrcPath/BookmarksPanel/utils/bookmark";
import { status2FA } from "SrcPath/SettingsPanel/apis/TwoFactorAuth";
import { getUserProfile } from "SrcPath/SettingsPanel/utils";
import {
  cachePersonImages,
  cachePersonImageUrlsInStorage,
  refreshPersonImageUrlsCache,
  resetPersons,
  syncPersonsFirebaseWithStorage,
  syncPersonsToStorage,
} from "SrcPath/TaggingPanel/utils/sync";

const syncAuthenticationToStorage = async (userProfile) => {
  const { is2FAEnabled } = await status2FA(userProfile.uid);
  userProfile.is2FAEnabled = is2FAEnabled;
  userProfile.isTOTPVerified = false;
  await storage.set({ [STORAGE_KEYS.userProfile]: userProfile });
};

const resetAuthentication = async () => {
  const userProfile = await getUserProfile();
  if (!userProfile) {
    console.log("User profile not found");
    return;
  }
  await identity.removeCachedAuthToken({ token: userProfile.googleAuthToken });
  console.log("Removed Google auth token from cache");
  await storage.remove(STORAGE_KEYS.userProfile);
};

const syncFirebaseToStorage = async () => {
  await Promise.all([
    syncRedirectionsToStorage(),
    syncBypassToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
    syncPersonsToStorage(),
  ]);
};

const syncStorageToFirebase = async () => {
  await Promise.all([
    syncBookmarksFirebaseWithStorage(),
    syncPersonsFirebaseWithStorage(),
  ]);
};

const resetStorage = async () => {
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
};

export const processPostLogin = async (userProfile) => {
  //First process authentication
  await syncAuthenticationToStorage(userProfile);
  //Then sync remote firebase to storage
  await syncFirebaseToStorage();
  //Then do other processes
  await cachePersonImageUrlsInStorage();
  await Promise.all([cacheBookmarkFavicons(), cachePersonImages()]);
};

export const processPreLogout = async () => {
  //Sync changes to firebase before logout, cant sync after logout
  await syncStorageToFirebase();
};

export const processPostLogout = async () => {
  //Reset storage
  await resetStorage();
  //Refresh browser cache
  await deleteAllCache([CACHE_BUCKET_KEYS.favicon, CACHE_BUCKET_KEYS.person]);
};
