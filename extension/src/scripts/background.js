import storage from "ChromeApi/storage";
import { EXTENSION_STATE } from "GlobalConstants";
import {
  fetchPageH1,
  getForumPageLinks,
  isValidUrl,
  setExtensionIcon,
} from "GlobalUtils/background";
import { bypass } from "GlobalUtils/bypass";
import { isExtensionActive, setExtStateInStorage } from "GlobalUtils/common";
import { redirect } from "GlobalUtils/redirect";
import siteSpecificLogic from "GlobalUtils/siteSpecificLogic";
import turnOffInputSuggestions from "GlobalUtils/turnOffInputSuggestions";
import { getExtensionState } from "SrcPath/helpers/fetchFromStorage";

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

const onBrowserStart = () => {
  storage
    .get(["extState", "hasPendingBookmarks", "hasPendingPersons"])
    .then(async ({ extState, hasPendingBookmarks, hasPendingPersons }) => {
      await setExtensionIcon({
        extState,
        hasPendingBookmarks,
        hasPendingPersons,
      });
    });
};

const onMessageReceive = (message, _sender, sendResponse) => {
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
  const { extState, hasPendingBookmarks, hasPendingPersons } = changedObj;
  if (extState || hasPendingBookmarks || hasPendingPersons) {
    setExtensionIcon({
      extState: extState?.newValue,
      hasPendingBookmarks: hasPendingBookmarks?.newValue,
      hasPendingPersons: hasPendingPersons?.newValue,
    });
  }
};

//First time extension install
chrome.runtime.onInstalled.addListener(onFirstTimeInstall);

//Listen when the browser is opened
chrome.runtime.onStartup.addListener(onBrowserStart);

//Listen tab url change
chrome.tabs.onUpdated.addListener(onUpdateCallback);

//Listen to dispatched messages
chrome.runtime.onMessage.addListener(onMessageReceive);

//Listen to chrome storage changes
chrome.storage.onChanged.addListener(onStorageChange);
