import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import {
  resetPersons,
  syncPersonsFirebaseWithStorage,
  syncPersonsToStorage,
} from "SrcPath/TaggingPanel/utils/sync";
import {
  resetBookmarks,
  syncBookmarksToStorage,
  syncBookmarksFirebaseWithStorage,
  cacheBookmarkFavicons,
} from "../BookmarksPanel/utils/bookmark";
import {
  resetAuthentication,
  syncAuthenticationToStorage,
} from "./authentication";
import { resetBypass, syncBypassToStorage } from "./bypass";
import { deleteAllCache } from "./cache";
import { resetLastVisited, syncLastVisitedToStorage } from "./lastVisited";
import { resetRedirections, syncRedirectionsToStorage } from "./redirect";

export const syncFirebaseToStorage = async (userProfile) => {
  await Promise.all([
    syncAuthenticationToStorage(userProfile),
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

export const resetStorage = async () => {
  await Promise.all([
    resetAuthentication(),
    resetRedirections(),
    resetBypass(),
    resetBookmarks(),
    resetLastVisited(),
    resetPersons(),
  ]);
};

export const processPostLogin = async () => {
  await Promise.all([cacheBookmarkFavicons()]);
};

export const processPostLogout = async () => {
  // Reset storage
  await resetStorage();
  //Refresh browser cache
  await deleteAllCache([CACHE_BUCKET_KEYS.favicon]);
};
