import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
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
import {
  cachePersonImages,
  cachePersonImageUrlsInStorage,
  refreshPersonImageUrlsCache,
  resetPersons,
  syncPersonsFirebaseWithStorage,
  syncPersonsToStorage,
} from "SrcPath/TaggingPanel/utils/sync";
import { resetAuthentication } from "./authentication";

export const syncFirebaseToStorage = async () => {
  await Promise.all([
    syncRedirectionsToStorage(),
    syncBypassToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
    syncPersonsToStorage(),
  ]);
};

export const syncStorageToFirebase = async () => {
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

export const processPostLogin = async () => {
  await cachePersonImageUrlsInStorage();
  await Promise.all([cacheBookmarkFavicons(), cachePersonImages()]);
};

export const processPostLogout = async () => {
  // Reset storage
  await resetStorage();
  //Refresh browser cache
  await deleteAllCache([CACHE_BUCKET_KEYS.favicon, CACHE_BUCKET_KEYS.person]);
};
