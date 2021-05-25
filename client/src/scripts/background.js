import action from "ChromeApi/action";
import storage from "ChromeApi/storage";
import { EXTENSION_STATE } from "GlobalConstants/index";
import {
  fetchPageH1,
  getExtensionIcon,
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

const setExtensionIcon = ({
  extState,
  hasPendingBookmarks,
  hasPendingPersons,
}) => {
  getExtensionIcon(extState, hasPendingBookmarks, hasPendingPersons).then(
    (icon) => {
      action.setIcon({ path: icon });
    }
  );
};

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
    .then(({ extState, hasPendingBookmarks, hasPendingPersons }) => {
      setExtensionIcon({ extState, hasPendingBookmarks, hasPendingPersons });
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
  setExtensionIcon({
    extState: extState?.newValue,
    hasPendingBookmarks: hasPendingBookmarks?.newValue,
    hasPendingPersons: hasPendingPersons?.newValue,
  });
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
