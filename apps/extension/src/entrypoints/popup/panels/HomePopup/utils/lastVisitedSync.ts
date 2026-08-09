import { trpcApi } from '@/apis/trpcApi';
import { lastVisitedItem } from '@/storage/items';

export const syncLastVisitedToStorage = async () => {
  const lastVisited = await trpcApi.firebaseData.lastVisitedGet.query();
  await lastVisitedItem.setValue(lastVisited);
};

export const resetLastVisited = async () => {
  await lastVisitedItem.removeValue();
};
