import { websitesItem } from '@/storage/items';

import { findForumSite } from './registry';

export const isForumPage = async (hostname: string) => {
  const websites = await websitesItem.getValue();
  return Boolean(findForumSite(websites, hostname));
};
