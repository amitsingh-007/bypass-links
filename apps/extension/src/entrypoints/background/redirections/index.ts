import { STORAGE_KEYS } from '@bypass/shared';
import { getMappedRedirections } from '@helpers/fetchFromStorage';
import { mapRedirections } from './mapper';
import { startHistoryWatch } from '@/utils/history';
import { trpcApi } from '@/apis/trpcApi';

export const redirect = async (tabId: number, url: URL) => {
  url.protocol = 'http:';

  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await browser.tabs.update(tabId, { url: atob(redirectUrl) });
    await startHistoryWatch();
  }
};

export const syncRedirectionsToStorage = async () => {
  const redirections = await trpcApi.firebaseData.redirectionsGet.query();
  await browser.storage.local.set({
    [STORAGE_KEYS.redirections]: redirections,
  });
  const mappedRedirections = mapRedirections(redirections);
  await browser.storage.local.set({
    [STORAGE_KEYS.mappedRedirections]: mappedRedirections,
  });
};

export const resetRedirections = async () => {
  await browser.storage.local.remove([
    STORAGE_KEYS.redirections,
    STORAGE_KEYS.mappedRedirections,
  ]);
};
