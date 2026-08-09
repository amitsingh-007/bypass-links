import { swrKeys } from '@bypass/shared';
import { mutate } from 'swr';

import { trpcApi } from '@/apis/trpcApi';
import { mappedRedirectionsItem, redirectionsItem } from '@/storage/items';

import { mapRedirections } from './mapper';

export const syncRedirectionsToStorage = async () => {
  const redirections = await trpcApi.firebaseData.redirectionsGet.query();
  await Promise.all([
    redirectionsItem.setValue(redirections),
    mappedRedirectionsItem.setValue(mapRedirections(redirections)),
  ]);
  await mutate(swrKeys.redirections);
};

export const resetRedirections = async () => {
  await Promise.all([
    redirectionsItem.removeValue(),
    mappedRedirectionsItem.removeValue(),
  ]);
};
