import { websitesItem } from '@/storage/items';

export const isForumPage = async (hostname: string) => {
  const websites = await websitesItem.getValue();
  return Object.values(websites).some((website) => hostname.includes(website));
};
