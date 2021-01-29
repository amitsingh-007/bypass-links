import storage from "ChromeApi/storage";
import { FIREBASE_DB_REF, STORAGE_KEYS } from "GlobalConstants/index";
import { getFromFirebase, saveDataToFirebase } from "GlobalUtils/firebase";

export const syncBookmarksToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.bookmarks);
  const bookmarks = snapshot.val();
  await storage.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
  console.log(`Bookmarks is set to`, bookmarks);
};

export const syncBookmarksFirebaseWithStorage = async () => {
  const {
    [STORAGE_KEYS.bookmarks]: bookmarks,
    hasPendingBookmarks,
  } = await storage.get([STORAGE_KEYS.bookmarks, "hasPendingBookmarks"]);
  if (!hasPendingBookmarks) {
    return;
  }
  console.log("Syncing bookmarks from storage to firebase", bookmarks);
  const isSaveSuccess = await saveDataToFirebase(
    bookmarks,
    FIREBASE_DB_REF.bookmarks
  );
  if (!isSaveSuccess) {
    throw new Error("Error while syncing bookmarks from storage to firebase");
  }
};

export const resetBookmarks = async () => {
  await storage.remove([STORAGE_KEYS.bookmarks, "hasPendingBookmarks"]);
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
