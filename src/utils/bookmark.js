import storage from "ChromeApi/storage";
import { FIREBASE_DB_REF, STORAGE_KEYS } from "GlobalConstants/index";
import { getFromFirebase } from "./firebase";

export const syncBookmarksToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.bookmarks);
  //   const bookmarks = getMappedBypass(snapshot.val());
  const bookmarks = snapshot.val();
  await storage.set({ [STORAGE_KEYS.bookmarks]: bookmarks });
  console.log(`Bookmarks is set to`, bookmarks);
};

export const resetBookmarks = async () => {
  await storage.remove(STORAGE_KEYS.bookmarks);
};
