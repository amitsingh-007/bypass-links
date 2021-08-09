import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { STORAGE_KEYS } from "GlobalConstants";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import storage from "GlobalHelpers/chrome/storage";
import { getBookmarks } from "GlobalHelpers/fetchFromStorage";
import { getFromFirebase, saveToFirebase } from "GlobalHelpers/firebase";
import { getCacheObj } from "GlobalUtils/cache";
import { getFaviconUrl } from ".";
import { IBookmarksObj } from "../interfaces";

export const syncBookmarksToStorage = async () => {
  const bookmarks = await getFromFirebase<IBookmarksObj>(
    FIREBASE_DB_REF.bookmarks
  );
  await storage.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
  console.log(`Bookmarks is set to`, bookmarks);
};

export const syncBookmarksFirebaseWithStorage = async () => {
  const { hasPendingBookmarks } = await storage.get("hasPendingBookmarks");
  const bookmarks = await getBookmarks();
  if (!hasPendingBookmarks) {
    return;
  }
  console.log("Syncing bookmarks from storage to firebase", bookmarks);
  const isSaveSuccess = await saveToFirebase(
    FIREBASE_DB_REF.bookmarks,
    bookmarks
  );
  if (isSaveSuccess) {
    await storage.remove("hasPendingBookmarks");
  } else {
    throw new Error("Error while syncing bookmarks from storage to firebase");
  }
};

export const resetBookmarks = async () => {
  await storage.remove([STORAGE_KEYS.bookmarks, "hasPendingBookmarks"]);
};

export const cacheBookmarkFavicons = async () => {
  const bookmarks = await getBookmarks();
  if (!bookmarks) {
    return;
  }
  const { urlList } = bookmarks;
  const faviconUrls = Object.values(urlList).map(({ url }) =>
    getFaviconUrl(decodeURIComponent(atob(url)))
  );
  const uniqueUrls = new Set(faviconUrls).values();
  const cache = await getCacheObj(CACHE_BUCKET_KEYS.favicon);
  await cache.addAll(uniqueUrls);
  console.log("Initialized cache for all bookmark urls");
};
