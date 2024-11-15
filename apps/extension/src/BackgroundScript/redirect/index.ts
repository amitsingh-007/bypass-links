import { trpcApi } from '@/apis/trpcApi';
import { startHistoryWatch } from '@/utils/history';
import { STORAGE_KEYS } from '@bypass/shared';
import { getMappedRedirections } from '@helpers/fetchFromStorage';
import { mapRedirections } from '../mapper/redirection';

export const redirect = async (tabId: number, url: URL) => {
  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  console.log('logging 3', tabId, url);
  if (redirectUrl) {
    console.log('logging 4', redirectUrl);
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
