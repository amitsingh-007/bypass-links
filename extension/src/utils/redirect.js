import { FIREBASE_DB_REF } from "../../../common/src/constants/firebase";
import storage from "ChromeApi/storage";
import tabs from "ChromeApi/tabs";
import { STORAGE_KEYS } from "GlobalConstants";
import { getFromFirebase } from "./firebase";

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
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.redirections);
  const redirections = snapshot.val();
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
