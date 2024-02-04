import { trpcApi } from '@/apis/trpcApi';
import { STORAGE_KEYS } from '@bypass/shared';

export const syncSettingsToStorage = async () => {
  const settings = await trpcApi.firebaseData.settingsGet.query();
  await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings ?? {} });
};

export const resetSettings = async () => {
  await chrome.storage.local.remove(STORAGE_KEYS.settings);
};
