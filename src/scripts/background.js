import { bypass } from "../utils/bypass";

const onUpdateCallback = (tabId, changeInfo) => {
  const { url } = changeInfo;
  if (url) {
    bypass(tabId, url);
  }
};

chrome.tabs.onUpdated.addListener(onUpdateCallback);
