import { FIREBASE_DB_REF } from "../../../../common/src/constants/firebase";
import storage from "ChromeApi/storage";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { STORAGE_KEYS } from "GlobalConstants";
import { getCacheObj } from "GlobalUtils/cache";
import { getFromFirebase, saveDataToFirebase } from "GlobalUtils/firebase";
import { getBookmarksObj, getFaviconUrl } from ".";

export const syncBookmarksToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.bookmarks);
  const bookmarks = snapshot.val();
  await storage.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
  console.log(`Bookmarks is set to`, bookmarks);
};

export const syncBookmarksFirebaseWithStorage = async () => {
  const { [STORAGE_KEYS.bookmarks]: bookmarks, hasPendingBookmarks } =
    await storage.get([STORAGE_KEYS.bookmarks, "hasPendingBookmarks"]);
  if (!hasPendingBookmarks) {
    return;
  }
  console.log("Syncing bookmarks from storage to firebase", bookmarks);
  const isSaveSuccess = await saveDataToFirebase(
    bookmarks,
    FIREBASE_DB_REF.bookmarks
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
  const bookmarks = await getBookmarksObj();
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
