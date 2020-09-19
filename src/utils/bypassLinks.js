import { LINKVERTISE } from "../constants";
import { bypassLinkvertise } from "./bypassLinkvertise";

const handleTargetUrl = (tab, targetUrl) => {
  //eslint-disable-next-line no-undef
  targetUrl && chrome.tabs.update(tab.id, { url: targetUrl });
};

export const bypassLink = () => {
  let currentTabUrl;
  let targetUrl;
  //eslint-disable-next-line no-undef
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    currentTabUrl = new URL(tabs[0].url);
    switch (currentTabUrl.hostname) {
      case LINKVERTISE:
        targetUrl = bypassLinkvertise(currentTabUrl);
        break;
      default:
        targetUrl = null;
    }
    handleTargetUrl(tabs, targetUrl);
  });
};
