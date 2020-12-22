import storage from "ChromeApi/storage";
import { FIREBASE_DB_REF } from "GlobalConstants/index";
import { getFromFirebase } from "./firebase";

export const syncBookmarksToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.bookmarks);
  //   const bookmarks = getMappedBypass(snapshot.val());
  const bookmarks = snapshot.val();
  await storage.set({ bookmarks });
  console.log(`Bookmarks is set to`, bookmarks);
};

export const resetBookmarks = async () => {
  await storage.remove("bookmarks");
};
