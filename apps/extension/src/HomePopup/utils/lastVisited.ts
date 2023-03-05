import { FIREBASE_DB_REF, STORAGE_KEYS } from '@bypass/shared';
import { getFromFirebase } from '@helpers/firebase/database';
import { LastVisited } from '../interfaces/lastVisited';

export const syncLastVisitedToStorage = async () => {
  const lastVisited = await getFromFirebase<LastVisited>(
    FIREBASE_DB_REF.lastVisited
  );
  await chrome.storage.local.set({ [STORAGE_KEYS.lastVisited]: lastVisited });
  console.log(`Last visited is set to`, lastVisited);
};

export const resetLastVisited = async () => {
  await chrome.storage.local.remove(STORAGE_KEYS.lastVisited);
};
