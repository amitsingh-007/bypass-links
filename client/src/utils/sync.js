import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import {
  cachePersonImages,
  cachePersonImageUrlsInStorage,
  refreshPersonImageUrlsCache,
  resetPersons,
  syncPersonsFirebaseWithStorage,
  syncPersonsToStorage,
} from "SrcPath/TaggingPanel/utils/sync";
import {
  cacheBookmarkFavicons,
  resetBookmarks,
  syncBookmarksFirebaseWithStorage,
  syncBookmarksToStorage,
} from "../BookmarksPanel/utils/bookmark";
import { resetAuthentication } from "./authentication";
import { resetBypass, syncBypassToStorage } from "./bypass";
import { deleteAllCache } from "./cache";
import { resetLastVisited, syncLastVisitedToStorage } from "./lastVisited";
import { resetRedirections, syncRedirectionsToStorage } from "./redirect";

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
