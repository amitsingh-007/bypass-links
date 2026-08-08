import { sha256Hash, swrKeyMatchers } from '@bypass/shared';
import { mutate } from 'swr';

import { lastVisitedItem } from '@/storage/items';

export const getHostnameHash = async (url: string) => {
  if (!URL.canParse(url)) {
    return '';
  }
  return sha256Hash(new URL(url).hostname);
};

export const getlastVisitedText = async (url: string) => {
  const lastVisitedData = await lastVisitedItem.getValue();
  const hash = await getHostnameHash(url);
  const lastVisitedDate = hash && lastVisitedData[hash];
  if (!lastVisitedDate) {
    return '';
  }
  const date = new Date(lastVisitedDate);
  return `${date.toDateString()}, ${date.toLocaleTimeString()}`;
};

export const setLastVisitedInStorage = async (
  hash: string,
  timestamp: number
) => {
  const lastVisitedObj = await lastVisitedItem.getValue();
  lastVisitedObj[hash] = timestamp;
  await lastVisitedItem.setValue(lastVisitedObj);
  await mutate(swrKeyMatchers.lastVisited);
};
