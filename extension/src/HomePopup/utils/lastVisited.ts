import storage from "ChromeApi/storage";
import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { STORAGE_KEYS } from "GlobalConstants";
import { getFromFirebase } from "GlobalUtils/firebase";

export const syncLastVisitedToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.lastVisited);
  const lastVisited = snapshot.val() || {};
  await storage.set({ [STORAGE_KEYS.lastVisited]: lastVisited });
  console.log(`Last visited is set to`, lastVisited);
};

export const resetLastVisited = async () => {
  await storage.remove(STORAGE_KEYS.lastVisited);
};
