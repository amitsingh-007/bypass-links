import { type IWebsites, STORAGE_KEYS } from '@bypass/shared';
import { trpcApi } from '@/apis/trpcApi';

const getDecodedWebsites = (encodedWebsites: IWebsites) => {
  return Object.entries(encodedWebsites).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: decodeURIComponent(atob(value)),
    };
  }, {});
};

export const syncWebsitesToStorage = async () => {
  const response = await trpcApi.firebaseData.websitesGet.query();
  const websitesData = getDecodedWebsites(response);
  await chrome.storage.local.set({ [STORAGE_KEYS.websites]: websitesData });
};

export const resetWebsites = async () => {
  await chrome.storage.local.remove(STORAGE_KEYS.websites);
};
