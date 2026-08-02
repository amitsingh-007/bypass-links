import { type IWebsites } from '@bypass/shared';

import { trpcApi } from '@/apis/trpcApi';
import { websitesItem } from '@/storage/items';

const decodeWebsite = (value?: string) =>
  value ? decodeURIComponent(atob(value)) : value;

const getDecodedWebsites = (encodedWebsites: IWebsites): IWebsites => ({
  FORUM_1: decodeWebsite(encodedWebsites.FORUM_1),
  FORUM_2: decodeWebsite(encodedWebsites.FORUM_2),
  FORUM_3: decodeWebsite(encodedWebsites.FORUM_3),
  FORUM_4: decodeWebsite(encodedWebsites.FORUM_4),
});

export const syncWebsitesToStorage = async () => {
  const response = await trpcApi.firebaseData.websitesGet.query();
  const websitesData = getDecodedWebsites(response);
  await websitesItem.setValue(websitesData);
};

export const resetWebsites = async () => {
  await websitesItem.removeValue();
};
