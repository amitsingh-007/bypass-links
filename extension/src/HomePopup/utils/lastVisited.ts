import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { STORAGE_KEYS } from "GlobalConstants";
import storage from "GlobalHelpers/chrome/storage";
import { getFromFirebase } from "GlobalHelpers/firebase/database";
import { LastVisited } from "../interfaces/lastVisited";

export const syncLastVisitedToStorage = async () => {
  const lastVisited = await getFromFirebase<LastVisited>(
    FIREBASE_DB_REF.lastVisited
  );
  await storage.set({ [STORAGE_KEYS.lastVisited]: lastVisited });
  console.log(`Last visited is set to`, lastVisited);
};

export const resetLastVisited = async () => {
  await storage.remove(STORAGE_KEYS.lastVisited);
};
