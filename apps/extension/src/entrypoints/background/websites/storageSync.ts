import { type IWebsites } from '@bypass/shared';

import { trpcApi } from '@/apis/trpcApi';
import { websitesItem } from '@/storage/items';

const decodeWebsite = (value?: string) =>
  value ? decodeURIComponent(atob(value)) : value;

// Key-agnostic so adding a forum to the schema cannot silently skip decoding
const getDecodedWebsites = (encodedWebsites: IWebsites): IWebsites =>
  Object.fromEntries(
    Object.entries(encodedWebsites).map(([key, value]) => [
      key,
      decodeWebsite(value),
    ])
  );

export const syncWebsitesToStorage = async () => {
  const response = await trpcApi.firebaseData.websitesGet.query();
  const websitesData = getDecodedWebsites(response);
  await websitesItem.setValue(websitesData);
};

export const resetWebsites = async () => {
  await websitesItem.removeValue();
};
