import { FIREBASE_DB_REF, STORAGE_KEYS } from '@bypass/shared';
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
  const bypassData = getDecodedBypass(response);
  await chrome.storage.local.set({ [STORAGE_KEYS.bypass]: bypassData });
  console.log('Bypass is set to', bypassData);
};

export const resetBypass = async () => {
  await chrome.storage.local.remove(STORAGE_KEYS.bypass);
};
