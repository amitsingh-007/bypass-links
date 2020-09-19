import { HOSTNAME } from "../constants";
import { bypassLinkvertise } from "./bypassLinkvertise";

const handleTargetUrl = async (tab, targetUrl) => {
  //eslint-disable-next-line no-undef
  targetUrl && chrome.tabs.update(tab.id, { url: targetUrl });
};

export const bypassLink = async () => {
  let currentTabUrl;
  let targetUrl;
  //eslint-disable-next-line no-undef
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    currentTabUrl = new URL(tabs[0].url);
    switch (currentTabUrl.hostname) {
      case HOSTNAME.LINKVERTISE:
        targetUrl = await bypassLinkvertise(currentTabUrl);
        break;
      default:
        targetUrl = null;
    }
    await handleTargetUrl(tabs, targetUrl);
  });
};
