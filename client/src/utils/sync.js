import {
  resetPersons,
  syncPersonsFirebaseWithStorage,
  syncPersonsToStorage,
} from "SrcPath/TaggingPanel/utils/sync";
import {
  resetBookmarks,
  syncBookmarksToStorage,
  syncBookmarksFirebaseWithStorage,
} from "../BookmarksPanel/utils/bookmark";
import {
  resetAuthentication,
  syncAuthenticationToStorage,
} from "./authentication";
import { resetBypass, syncBypassToStorage } from "./bypass";
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
