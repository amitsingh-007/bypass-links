import { resetBookmarks, syncBookmarksToStorage } from "../BookmarksPanel/utils/bookmark";
import { resetBypass, syncBypassToStorage } from "./bypass";
import { resetRedirections, syncRedirectionsToStorage } from "./redirect";

export const syncFirebaseToStorage = async () => {
  await Promise.all([
    syncRedirectionsToStorage(),
    syncBypassToStorage(),
    syncBookmarksToStorage(),
  ]);
};

export const resetStorage = async () => {
  await Promise.all([resetRedirections(), resetBypass(), resetBookmarks()]);
};
