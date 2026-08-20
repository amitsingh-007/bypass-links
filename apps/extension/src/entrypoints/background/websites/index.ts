import { websitesItem } from '@/storage/items';

export const isForumPage = async (url = '') => {
  const hostname = url && new URL(url).hostname;
  const websites = await websitesItem.getValue();
  // hostname.includes('') is true for every page
  return Object.values(websites).some((website) =>
    Boolean(website && hostname.includes(website))
  );
};
