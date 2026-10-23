import { websitesItem } from '@/storage/items';

export const isForumPage = async (url?: string) => {
  if (!url) {
    return false;
  }
  const { hostname } = new URL(url);
  const websites = await websitesItem.getValue();
  // hostname.includes('') is true for every page
  return Object.values(websites).some((website) =>
    Boolean(website && hostname.includes(website))
  );
};
