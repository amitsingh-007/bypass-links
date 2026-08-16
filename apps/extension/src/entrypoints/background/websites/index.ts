import { websitesItem } from '@/storage/items';

import { findForumExtractor } from './registry';

export const isForumPage = async (hostname: string) => {
  const websites = await websitesItem.getValue();
  return Boolean(findForumExtractor(websites, hostname));
};
