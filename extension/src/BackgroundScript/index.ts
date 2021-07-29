import storage from "GlobalHelpers/chrome/storage";
import { EXTENSION_STATE, STORAGE_KEYS } from "GlobalConstants";
import { fetchPageH1, isValidUrl, setExtensionIcon } from "./utils";
import { bypass } from "./bypass";
import { isExtensionActive, setExtStateInStorage } from "GlobalUtils/common";
import { redirect } from "./redirect";
import siteSpecificLogic from "./siteSpecificLogic";
import turnOffInputSuggestions from "./misc/turnOffInputSuggestions";
import { getExtensionState } from "GlobalHelpers/fetchFromStorage";
import { getForumPageLinks } from "./misc/forumPageLinks";

//First time extension install
chrome.runtime.onInstalled.addListener(() => {
  setExtStateInStorage(EXTENSION_STATE.ACTIVE);
});

//Listen when the browser is opened
chrome.runtime.onStartup.addListener(() => {
  storage
    .get(["extState", "hasPendingBookmarks", STORAGE_KEYS.hasPendingPersons])
    .then(
      async ({
        extState,
        hasPendingBookmarks,
        [STORAGE_KEYS.hasPendingPersons]: hasPendingPersons,
      }) => {
        await setExtensionIcon({
          extState,
          hasPendingBookmarks,
          hasPendingPersons,
        });
      }
    );
});

//Listen tab url change
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  const { url = "" } = changeInfo;
  const extState = await getExtensionState();
  if (isValidUrl(url) && isExtensionActive(extState)) {
    const currentTabUrl = new URL(url);
    bypass(tabId, currentTabUrl);
    redirect(tabId, currentTabUrl);
    turnOffInputSuggestions(tabId);
    siteSpecificLogic(tabId, currentTabUrl);
  }
});

//Listen to dispatched messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
});

//Listen to chrome storage changes
chrome.storage.onChanged.addListener((changedObj, storageType) => {
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
});
