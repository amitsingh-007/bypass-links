import storage from "../scripts/chrome/storage";
import { bypassBonsai } from "./bypassBonsai";
import { bypassBonsaiLink } from "./bypassBonsaiLink";
import { bypassForums } from "./bypassForums";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { bypassMedium } from "./bypassMedium";
import { bypassPageLinks } from "./bypassPageLinks";
import { changeTabUrl } from "./changeTabUrl";

const BYPASS_EXECUTORS = [
  bypassLinkvertise,
  bypassBonsai,
  bypassBonsaiLink,
  bypassForums,
  bypassPageLinks,
  bypassMedium,
];

let REDIRECTIONS = null;

const getRedirections = async () => {
  if (!REDIRECTIONS) {
    const { redirections } = await storage.get(["redirections"]);
    REDIRECTIONS = redirections;
  }
  return REDIRECTIONS;
};

export const bypass = async (tabId, url) => {
  BYPASS_EXECUTORS.forEach(async (executor) => {
    await executor(url, tabId);
  });
};

export const redirect = async (tabId, url) => {
  const redirections = await getRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await changeTabUrl(tabId, atob(redirectUrl));
  }
};
