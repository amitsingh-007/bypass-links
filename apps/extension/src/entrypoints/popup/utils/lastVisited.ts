import { sha256Hash } from '@bypass/shared';
import { mutate } from 'swr';

import { lastVisitedItem } from '@/storage/items';
import { extSwrKeyMatchers } from '@/swr/keys';

export const getHostnameHash = async (url: string) => {
  if (!URL.canParse(url)) {
    return '';
  }
  return sha256Hash(new URL(url).hostname);
};

const lastVisitedFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

const formatLastVisited = (timestamp?: number) =>
  timestamp ? lastVisitedFormat.format(timestamp) : '';

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
  await mutate(extSwrKeyMatchers.lastVisited);
};
