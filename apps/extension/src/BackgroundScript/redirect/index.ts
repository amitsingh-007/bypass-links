import { FIREBASE_DB_REF, STORAGE_KEYS } from '@bypass/shared';
import storage from '@helpers/chrome/storage';
import tabs from '@helpers/chrome/tabs';
import { getMappedRedirections } from '@helpers/fetchFromStorage';
import { getFromFirebase } from '@helpers/firebase/database';
import { IRedirection } from '../interfaces/redirections';
import { mapRedirections } from '../mapper/redirection';

export const redirect = async (tabId: number, url: URL) => {
  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await tabs.update(tabId, { url: atob(redirectUrl) });
  }
};

export const syncRedirectionsToStorage = async () => {
  const redirections = await getFromFirebase<IRedirection[]>(
    FIREBASE_DB_REF.redirections
  );
  await storage.set({ [STORAGE_KEYS.redirections]: redirections });
  const mappedRedirections = mapRedirections(redirections);
  await storage.set({ [STORAGE_KEYS.mappedRedirections]: mappedRedirections });
  console.log(`Redirections is set to`, redirections);
};

export const resetRedirections = async () => {
  await storage.remove([
    STORAGE_KEYS.redirections,
    STORAGE_KEYS.mappedRedirections,
  ]);
};