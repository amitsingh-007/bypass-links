import { HOSTNAME } from "../constants";
import { bypassBonsai } from "./bypassBonsai";
import { bypassPageLinks } from "./bypassPageLinks";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { changeTabUrl } from "./changeTabUrl";
import { bypassMedium } from "./bypassMedium";

export const bypass = async (tabId, url) => {
  const currentTabUrl = new URL(url);
  const hostName = currentTabUrl.hostname;
  let targetUrl;
  if (hostName === HOSTNAME.LINKVERTISE) {
    /* bypass linkvertise */
    targetUrl = await bypassLinkvertise(currentTabUrl);
  } else if (hostName === HOSTNAME.BONSAI) {
    /* bypass bonsai */
    targetUrl = await bypassBonsai(currentTabUrl);
  } else if (
    hostName === HOSTNAME.PASTELINK ||
    hostName === HOSTNAME.JUSTPASTEIT ||
    hostName === HOSTNAME.RENTRY
  ) {
    /* bypass pages */
    bypassPageLinks(tabId);
  } else if (hostName.includes(HOSTNAME.MEDIUM)) {
    /* bypass medium */
    bypassMedium(currentTabUrl, tabId);
  } else {
    targetUrl = null;
  }
  await changeTabUrl(tabId, targetUrl);
};
