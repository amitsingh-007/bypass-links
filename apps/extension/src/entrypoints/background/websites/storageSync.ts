import { type IWebsites } from '@bypass/shared';
import { trpcApi } from '@/apis/trpcApi';
import { websitesItem } from '@/storage/items';

const getDecodedWebsites = (encodedWebsites: IWebsites): IWebsites => {
  return Object.entries(encodedWebsites).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: decodeURIComponent(atob(value)),
    };
  }, {} as IWebsites);
};

export const syncWebsitesToStorage = async () => {
  const response = await trpcApi.firebaseData.websitesGet.query();
  const websitesData = getDecodedWebsites(response);
  await websitesItem.setValue(websitesData);
};

export const resetWebsites = async () => {
  await websitesItem.removeValue();
};
