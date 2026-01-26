import { getLastVisited } from '@helpers/fetchFromStorage';
import { sha256Hash } from '@bypass/shared';

export const getlastVisitedText = async (url: string) => {
  const lastVisitedData = await getLastVisited();
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
