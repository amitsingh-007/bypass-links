import {
  resetBookmarks,
  syncBookmarksToStorage,
  syncBookmarksFirebaseWithStorage,
} from "../BookmarksPanel/utils/bookmark";
import { resetBypass, syncBypassToStorage } from "./bypass";
import { resetLastVisited, syncLastVisitedToStorage } from "./lastVisited";
import { resetRedirections, syncRedirectionsToStorage } from "./redirect";

export const syncFirebaseToStorage = async () => {
  await Promise.all([
    syncRedirectionsToStorage(),
    syncBypassToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
  ]);
};

export const syncStorageToFirebase = async () => {
  await Promise.all([syncBookmarksFirebaseWithStorage()]);
};

export const resetStorage = async () => {
  //First sync storage to firebase
  await syncStorageToFirebase();

  //Then reset storage
  await Promise.all([
    resetRedirections(),
    resetBypass(),
    resetBookmarks(),
    resetLastVisited(),
  ]);
};
