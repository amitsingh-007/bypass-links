import { STORAGE_KEYS } from '@bypass/shared';
import { getMappedRedirections } from '@helpers/fetchFromStorage';
import { mapRedirections } from './mapper';
import { startHistoryWatch } from '@/utils/history';
import { trpcApi } from '@/apis/trpcApi';

export const redirect = async (tabId: number, url: URL) => {
  // Firefox sometimes changes protocol to https
  url.protocol = 'http:';

  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await chrome.tabs.update(tabId, { url: atob(redirectUrl) });
    await startHistoryWatch();
  }
};

export const syncRedirectionsToStorage = async () => {
  const redirections = await trpcApi.firebaseData.redirectionsGet.query();
  await chrome.storage.local.set({ [STORAGE_KEYS.redirections]: redirections });
  const mappedRedirections = mapRedirections(redirections);
  await chrome.storage.local.set({
    [STORAGE_KEYS.mappedRedirections]: mappedRedirections,
  });
};

export const resetRedirections = async () => {
  await chrome.storage.local.remove([
    STORAGE_KEYS.redirections,
    STORAGE_KEYS.mappedRedirections,
  ]);
};
