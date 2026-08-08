import { sha256Hash, swrKeyMatchers } from '@bypass/shared';
import { mutate } from 'swr';

import { lastVisitedItem } from '@/storage/items';

export const getHostnameHash = async (url: string) => {
  if (!URL.canParse(url)) {
    return '';
  }
  return sha256Hash(new URL(url).hostname);
};

const formatLastVisited = (timestamp?: number) => {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  return `${date.toDateString()}, ${date.toLocaleTimeString()}`;
};

export const getlastVisitedText = async (url: string) => {
  const lastVisitedData = await lastVisitedItem.getValue();
  const hash = await getHostnameHash(url);
  return formatLastVisited(hash ? lastVisitedData[hash] : undefined);
};

export const getLastVisitedTextMap = async (urls: string[]) => {
  const lastVisitedData = await lastVisitedItem.getValue();
  const entries = await Promise.all(
    [...new Set(urls.filter(Boolean))].map(async (url) => {
      const hash = await getHostnameHash(url);
      return [url, formatLastVisited(lastVisitedData[hash])] as const;
    })
  );
  return Object.fromEntries(entries);
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
