import { bypassLink } from "../utils/bypassLinks";

const onUpdateCallback = (tabId, changeInfo) => {
  const { url } = changeInfo;
  if (url) {
    bypassLink(tabId, url);
  }
};

chrome.tabs.onUpdated.addListener(onUpdateCallback);
