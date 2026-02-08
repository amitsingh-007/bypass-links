import { STORAGE_KEYS } from '@bypass/shared';
import { trpcApi } from '@/apis/trpcApi';

export const syncLastVisitedToStorage = async () => {
  const lastVisited = await trpcApi.firebaseData.lastVisitedGet.query();
  await browser.storage.local.set({ [STORAGE_KEYS.lastVisited]: lastVisited });
};

export const resetLastVisited = async () => {
  await browser.storage.local.remove(STORAGE_KEYS.lastVisited);
};
