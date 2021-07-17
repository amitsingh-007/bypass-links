import { FIREBASE_DB_REF } from "@common/constants/firebase";
import storage from "GlobalHelpers/chrome/storage";
import tabs from "GlobalHelpers/chrome/tabs";
import { STORAGE_KEYS } from "GlobalConstants";
import { getFromFirebase } from "../../helpers/firebase";

const getMappedRedirections = (redirections) =>
  redirections &&
  redirections.reduce((obj, { alias, website }) => {
    obj[alias] = website;
    return obj;
  }, {});

const getRedirections = async () => {
  const { mappedRedirections } = await storage.get([
    STORAGE_KEYS.mappedRedirections,
  ]);
  return mappedRedirections || {};
};

export const redirect = async (tabId, url) => {
  const redirections = await getRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await tabs.update(tabId, { url: atob(redirectUrl) });
  }
};

export const syncRedirectionsToStorage = async () => {
  const redirections = await getFromFirebase(FIREBASE_DB_REF.redirections);
  await storage.set({ [STORAGE_KEYS.redirections]: redirections });
  const mappedRedirections = getMappedRedirections(redirections);
  await storage.set({ [STORAGE_KEYS.mappedRedirections]: mappedRedirections });
  console.log(`Redirections is set to`, redirections);
};

export const resetRedirections = async () => {
  await storage.remove([
    STORAGE_KEYS.redirections,
    STORAGE_KEYS.mappedRedirections,
  ]);
};
