import { EXTENSION_STATE, HOSTNAME } from "../constants";
import { bypassBonsai } from "./bypassBonsai";
import { bypassPageLinks } from "./bypassPageLinks";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { changeTabUrl } from "./changeTabUrl";
import { bypassMedium } from "./bypassMedium";
import { bypassForums } from "./bypassForums";

export const bypass = async (tabId, url, extensionState) => {
  if (extensionState === EXTENSION_STATE.INACTIVE) {
    return;
  }
  const currentTabUrl = new URL(url);
  const hostName = currentTabUrl.hostname;
  let targetUrl;
  if (hostName === HOSTNAME.LINKVERTISE) {
    /* BYPASS LINKVERTISE */
    targetUrl = await bypassLinkvertise(currentTabUrl);
  } else if (hostName === HOSTNAME.BONSAI) {
    /* BYPASS BONSAI */
    targetUrl = await bypassBonsai(currentTabUrl);
  } else if (hostName.startsWith(HOSTNAME.FORUMS)) {
    /* BYPASS FORUMS */
    bypassForums(currentTabUrl, tabId);
  } else if (
    hostName === HOSTNAME.PASTELINK ||
    hostName === HOSTNAME.JUSTPASTEIT ||
    hostName === HOSTNAME.RENTRY
  ) {
    /* BYPASS PAGE LINKS */
    bypassPageLinks(tabId);
  } else if (hostName.includes(HOSTNAME.MEDIUM)) {
    /* BYPASS MEDIUM */
    bypassMedium(currentTabUrl, tabId);
  } else {
    targetUrl = null;
  }
  await changeTabUrl(tabId, targetUrl);
};
