import { FIREBASE_DB_REF, STORAGE_KEYS } from '@bypass/shared';
import { getMappedRedirections } from '@helpers/fetchFromStorage';
import { getFromFirebase } from '@helpers/firebase/database';
import { IRedirection } from '../interfaces/redirections';
import { mapRedirections } from '../mapper/redirection';

export const redirect = async (tabId: number, url: URL) => {
  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await chrome.tabs.update(tabId, { url: atob(redirectUrl) });
  }
};

export const syncRedirectionsToStorage = async () => {
  const redirections = await getFromFirebase<IRedirection[]>(
    FIREBASE_DB_REF.redirections
  );
  await chrome.storage.local.set({ [STORAGE_KEYS.redirections]: redirections });
  const mappedRedirections = mapRedirections(redirections);
  await chrome.storage.local.set({
    [STORAGE_KEYS.mappedRedirections]: mappedRedirections,
  });
  console.log(`Redirections is set to`, redirections);
};

export const resetRedirections = async () => {
  await chrome.storage.local.remove([
    STORAGE_KEYS.redirections,
    STORAGE_KEYS.mappedRedirections,
  ]);
};
