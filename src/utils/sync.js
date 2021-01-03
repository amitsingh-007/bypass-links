import {
  resetBookmarks,
  syncBookmarksToStorage,
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

export const resetStorage = async () => {
  await Promise.all([
    resetRedirections(),
    resetBypass(),
    resetBookmarks(),
    resetLastVisited(),
  ]);
};
