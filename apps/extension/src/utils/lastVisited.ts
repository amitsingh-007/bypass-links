import { getLastVisited } from '@helpers/fetchFromStorage';
import md5 from 'md5';

export const getlastVisitedText = async (url: string) => {
  const lastVisitedData = await getLastVisited();
  if (!URL.canParse(url)) {
    return '';
  }
  const { hostname } = new URL(url);
  const lastVisitedDate = lastVisitedData[md5(hostname)];
  if (!lastVisitedDate) {
    return '';
  }
  const date = new Date(lastVisitedDate);
  return `${date.toDateString()}, ${date.toLocaleTimeString()}`;
};
