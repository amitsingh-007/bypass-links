import storage from "ChromeApi/storage";
import { getFromFirebase } from "GlobalUtils/firebase";
import { bypassBonsai } from "./bypassBonsai";
import { bypassBonsaiLink } from "./bypassBonsaiLink";
import { bypassForums } from "./bypassForums";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { bypassMedium } from "./bypassMedium";
import { bypassPageLinks } from "./bypassPageLinks";
import { FIREBASE_DB_REF, STORAGE_KEYS } from "GlobalConstants/index";

const getMappedBypass = (bypass) =>
  bypass &&
  Object.entries(bypass).reduce((obj, [key, value]) => {
    obj[decodeURIComponent(atob(key))] = value;
    return obj;
  }, {});

const getHostnames = async () => {
  const { [STORAGE_KEYS.bypass]: bypass } = await storage.get([
    STORAGE_KEYS.bypass,
  ]);
  return bypass || {};
};

const bypassAndHostnameMapping = {
  LINKVERTISE: bypassLinkvertise,
  BONSAI: bypassBonsai,
  BONSAILINK: bypassBonsaiLink,
  FORUMS: bypassForums,
  JUSTPASTEIT: bypassPageLinks,
  PASTELINK: bypassPageLinks,
  RENTRY: bypassPageLinks,
  MEDIUM: bypassMedium,
};

const getBypassExecutor = async (url) => {
  const hostnames = await getHostnames();
  const hostnameAlias = hostnames[url.hostname];
  if (bypassAndHostnameMapping[hostnameAlias]) {
    return bypassAndHostnameMapping[hostnameAlias];
  }
  if (url.hostname.includes("medium.com")) {
    return bypassAndHostnameMapping.MEDIUM;
  }
  return null;
};

export const bypass = async (tabId, url) => {
  const bypassExecutor = await getBypassExecutor(url);
  if (bypassExecutor) {
    await bypassExecutor(url, tabId);
  }
};

export const syncBypassToStorage = async () => {
  const snapshot = await getFromFirebase(FIREBASE_DB_REF.bypass);
  const bypass = getMappedBypass(snapshot.val());
  await storage.set({ [STORAGE_KEYS.bypass]: bypass });
  console.log(`Bypass is set to`, bypass);
};

export const resetBypass = async () => {
  await storage.remove(STORAGE_KEYS.bypass);
};
