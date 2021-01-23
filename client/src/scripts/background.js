import browserAction from "ChromeApi/browserAction";
import { EXTENSION_STATE } from "GlobalConstants/index";
import {
  fetchPageH1,
  getForumPageLinks,
  isValidUrl,
} from "GlobalUtils/background";
import { bypass } from "GlobalUtils/bypass/index";
import {
  getExtensionState,
  isExtensionActive,
  setExtStateInStorage,
} from "GlobalUtils/common";
import { redirect } from "GlobalUtils/redirect";
import siteSpecificLogic from "GlobalUtils/siteSpecificLogic/index";
import turnOffInputSuggestions from "GlobalUtils/turnOffInputSuggestions";

const onUpdateCallback = async (tabId, changeInfo) => {
  const { url } = changeInfo;
  const extState = await getExtensionState();
  if (isValidUrl(url) && isExtensionActive(extState)) {
    const currentTabUrl = new URL(url);
    bypass(tabId, currentTabUrl);
    redirect(tabId, currentTabUrl);
    turnOffInputSuggestions(tabId);
    siteSpecificLogic(tabId, currentTabUrl);
  }
};

const onFirstTimeInstall = () => {
  setExtStateInStorage(EXTENSION_STATE.ACTIVE);
};

const onMessageReceive = (message, sender, sendResponse) => {
  if (message.getForumPageLinks) {
    getForumPageLinks(message.getForumPageLinks).then((forumPageLinks) => {
      sendResponse({ forumPageLinks });
    });
  } else if (message.fetchPageH1) {
    fetchPageH1().then((pageH1) => {
      sendResponse({ pageH1 });
    });
  }
  return true;
};

const onStorageChange = (changedObj, storageType) => {
  if (storageType !== "local") {
    return;
  }
  const { extState } = changedObj;
  if (extState) {
    const icon = isExtensionActive(extState.newValue)
      ? "bypass_link_on_128.png"
      : "bypass_link_off_128.png";
    browserAction.setIcon({ path: icon });
  }
};

//Listen tab url change
chrome.tabs.onUpdated.addListener(onUpdateCallback);

//First time extension install
chrome.runtime.onInstalled.addListener(onFirstTimeInstall);

//Listen to dispatched messages
chrome.runtime.onMessage.addListener(onMessageReceive);

//Listen to chrome storage changes
chrome.storage.onChanged.addListener(onStorageChange);
