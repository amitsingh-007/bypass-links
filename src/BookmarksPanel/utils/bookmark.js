import storage from "ChromeApi/storage";
import { FIREBASE_DB_REF, STORAGE_KEYS } from "GlobalConstants/index";
import { getFromFirebase } from "GlobalUtils/firebase";

export const syncBookmarksToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.bookmarks);
  const bookmarks = snapshot.val();
  await storage.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
  console.log(`Bookmarks is set to`, bookmarks);
};

export const resetBookmarks = async () => {
  await storage.remove(STORAGE_KEYS.bookmarks);
};

export const getBookmarksObj = async () => {
  const { [STORAGE_KEYS.bookmarks]: bookmarks } = await storage.get(
    STORAGE_KEYS.bookmarks
  );
  return bookmarks;
};

export const getFromHash = async (isDir, hash) => {
  const bookmarks = await getBookmarksObj();
  return isDir ? bookmarks.folderList[hash] : bookmarks.urlList[hash];
};
