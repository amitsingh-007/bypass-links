import { websitesItem } from '@/storage/items';

export const isForumPage = async (hostname: string) => {
  const websites = await websitesItem.getValue();
  // Falsy entries are filtered: hostname.includes('') is true for every page
  return Object.values(websites).some(
    (website) => Boolean(website) && hostname.includes(website)
  );
};
