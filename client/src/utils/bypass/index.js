import storage from "ChromeApi/storage";
import {
  BYPASS_KEYS,
  FIREBASE_DB_REF,
  STORAGE_KEYS,
} from "GlobalConstants/index";
import { getHostnameAlias } from "GlobalUtils/common";
import { getFromFirebase } from "GlobalUtils/firebase";
import { bypassBonsai } from "./bypassBonsai";
import { bypassBonsaiLink } from "./bypassBonsaiLink";
import { bypassForums } from "./bypassForums";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { bypassMedium } from "./bypassMedium";
import { bypassPageLinks } from "./bypassPageLinks";

const getMappedBypass = (bypass) =>
  bypass &&
  Object.entries(bypass).reduce((obj, [key, value]) => {
    obj[decodeURIComponent(atob(key))] = value;
    return obj;
  }, {});

const bypassAndHostnameMapping = {
  [BYPASS_KEYS.LINKVERTISE]: bypassLinkvertise,
  [BYPASS_KEYS.BONSAI]: bypassBonsai,
  [BYPASS_KEYS.BONSAILINK]: bypassBonsaiLink,
  [BYPASS_KEYS.FORUMS]: bypassForums,
  [BYPASS_KEYS.JUSTPASTEIT]: bypassPageLinks,
  [BYPASS_KEYS.PASTELINK]: bypassPageLinks,
  [BYPASS_KEYS.RENTRY]: bypassPageLinks,
  [BYPASS_KEYS.MEDIUM]: bypassMedium,
};

const getBypassExecutor = async (url) => {
  const hostnameAlias = await getHostnameAlias(url.hostname);
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
