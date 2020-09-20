import { HOSTNAME } from "../constants";
import { bypassBonsai } from "./bypassBonsai";
import { bypassLinkvertise } from "./bypassLinkvertise";

const handleTargetUrl = async (tabId, targetUrl) => {
  //eslint-disable-next-line no-undef
  targetUrl && chrome.tabs.update(tabId, { url: targetUrl });
};

export const bypassLink = async (tabId, url) => {
  const currentTabUrl = new URL(url);
  let targetUrl;
  //eslint-disable-next-line no-undef
  switch (currentTabUrl.hostname) {
    case HOSTNAME.LINKVERTISE:
      targetUrl = await bypassLinkvertise(currentTabUrl);
      break;
    case HOSTNAME.BONSAI:
      targetUrl = await bypassBonsai(currentTabUrl);
      break;
    default:
      targetUrl = null;
  }
  await handleTargetUrl(tabId, targetUrl);
};
