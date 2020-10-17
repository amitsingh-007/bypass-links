import { EXTENSION_STATE, HOSTNAME } from "../constants";
import { bypassBonsai } from "./bypassBonsai";
import { bypassPageLinks } from "./bypassPageLinks";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { changeTabUrl } from "./changeTabUrl";
import { bypassMedium } from "./bypassMedium";
import { bypassForums } from "./bypassForums";
import { bypassBonsaiLink } from "./bypassBonsaiLink";

export const bypass = async (tabId, url, extensionState) => {
  if (extensionState === EXTENSION_STATE.INACTIVE) {
    return;
  }
  const currentTabUrl = new URL(url);
  const hostName = currentTabUrl.hostname;
  let targetUrl;
  if (hostName === HOSTNAME.LINKVERTISE) {
    targetUrl = await bypassLinkvertise(currentTabUrl);
  } else if (hostName === HOSTNAME.BONSAI) {
    targetUrl = await bypassBonsai(currentTabUrl);
  } else if (hostName === HOSTNAME.BONSAILINK) {
    targetUrl = await bypassBonsaiLink(tabId);
  } else if (hostName.startsWith(HOSTNAME.FORUMS)) {
    bypassForums(currentTabUrl, tabId);
  } else if (
    hostName === HOSTNAME.PASTELINK ||
    hostName === HOSTNAME.JUSTPASTEIT ||
    hostName === HOSTNAME.RENTRY
  ) {
    bypassPageLinks(tabId);
  } else if (hostName.includes(HOSTNAME.MEDIUM)) {
    bypassMedium(currentTabUrl, tabId);
  } else {
    targetUrl = null;
  }
  await changeTabUrl(tabId, targetUrl);
};
