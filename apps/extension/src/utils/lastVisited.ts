import { sha256Hash } from '@bypass/shared';
import { lastVisitedItem } from '@/storage/items';

export const getlastVisitedText = async (url: string) => {
  const lastVisitedData = await lastVisitedItem.getValue();
  if (!URL.canParse(url)) {
    return '';
  }
  const { hostname } = new URL(url);
  const hash = await sha256Hash(hostname);
  const lastVisitedDate = lastVisitedData[hash];
  if (!lastVisitedDate) {
    return '';
  }
  const date = new Date(lastVisitedDate);
  return `${date.toDateString()}, ${date.toLocaleTimeString()}`;
};
