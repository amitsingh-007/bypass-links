import { FIREBASE_DB_REF } from '@bypass/shared/constants/firebase';
import { STORAGE_KEYS } from '@bypass/shared/constants/storage';
import storage from '@helpers/chrome/storage';
import { getFromFirebase } from '@helpers/firebase/database';
import { IBypass } from '../interfaces/bypass';
import { getBypassExecutor, getDecodedBypass } from './bypassUtils';

export const bypass = async (tabId: number, url: URL) => {
  const bypassExecutor = await getBypassExecutor(url);
  if (bypassExecutor) {
    await bypassExecutor(url, tabId);
  }
};

export const syncBypassToStorage = async () => {
  const response = await getFromFirebase<IBypass>(FIREBASE_DB_REF.bypass);
  const bypass = getDecodedBypass(response);
  await storage.set({ [STORAGE_KEYS.bypass]: bypass });
  console.log('Bypass is set to', bypass);
};

export const resetBypass = async () => {
  await storage.remove(STORAGE_KEYS.bypass);
};
