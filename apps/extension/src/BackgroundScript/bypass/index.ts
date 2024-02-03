import { trpcApi } from '@/apis/trpcApi';
import { STORAGE_KEYS } from '@bypass/shared';
import { getBypassExecutor, getDecodedBypass } from './bypassUtils';

export const bypass = async (tabId: number, url: URL) => {
  const bypassExecutor = await getBypassExecutor(url);
  if (bypassExecutor) {
    await bypassExecutor(url, tabId);
  }
};

export const syncBypassToStorage = async () => {
  const response = await trpcApi.firebaseData.bypassGet.query();
  const bypassData = getDecodedBypass(response);
  await chrome.storage.local.set({ [STORAGE_KEYS.bypass]: bypassData });
};

export const resetBypass = async () => {
  await chrome.storage.local.remove(STORAGE_KEYS.bypass);
};
