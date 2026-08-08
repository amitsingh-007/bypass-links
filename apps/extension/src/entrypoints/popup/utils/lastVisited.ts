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

/**
 * One storage read and one hashing pass for a whole list. Resolving per row
 * instead re-read the entire map and re-ran SHA-256 for every rule.
 */
export const getLastVisitedTextMap = async (urls: string[]) => {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  const [lastVisitedData, hashes] = await Promise.all([
    lastVisitedItem.getValue(),
    Promise.all(uniqueUrls.map(getHostnameHash)),
  ]);
  return Object.fromEntries(
    uniqueUrls.map((url, index) => [
      url,
      formatLastVisited(lastVisitedData[hashes[index]]),
    ])
  );
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
