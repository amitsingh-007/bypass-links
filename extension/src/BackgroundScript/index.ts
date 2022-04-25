import { EXTENSION_STATE } from "GlobalConstants";
import storage from "GlobalHelpers/chrome/storage";
import { getExtensionState } from "GlobalHelpers/fetchFromStorage";
import { isExtensionActive, setExtStateInStorage } from "GlobalUtils/common";
import { manageGoogleActivity } from "./automation/manageGoogleActivity";
import { bypass } from "./bypass";
import { getForumPageLinks } from "./misc/forumPageLinks";
import turnOffInputSuggestions from "./misc/turnOffInputSuggestions";
import { redirect } from "./redirect";
import { fetchPageH1, isValidUrl, setExtensionIcon } from "./utils";

//First time extension install
chrome.runtime.onInstalled.addListener(() => {
  setExtStateInStorage(EXTENSION_STATE.ACTIVE);
});

//Listen when the browser is opened
chrome.runtime.onStartup.addListener(() => {
  storage
    .get(["extState", "hasPendingBookmarks", "hasPendingPersons"])
    .then(async ({ extState, hasPendingBookmarks, hasPendingPersons }) => {
      await setExtensionIcon({
        extState,
        hasPendingBookmarks,
        hasPendingPersons,
      });
    });
});

const onPageLoad = async (tabId: number, url: string) => {
  const extState = await getExtensionState();
  if (isValidUrl(url) && isExtensionActive(extState)) {
    const currentTabUrl = new URL(url);
    bypass(tabId, currentTabUrl);
    redirect(tabId, currentTabUrl);
    turnOffInputSuggestions(tabId);
  }
};

//Listen tab url change
chrome.tabs.onUpdated.addListener((tabId, changeInfo) =>
  onPageLoad(tabId, changeInfo?.url ?? "")
);

/**
 * NOTE: Can remove chrome.tabs.onUpdated in favor of this
 * @link https://stackoverflow.com/questions/16949810/how-can-i-run-this-script-when-the-tab-reloads-chrome-extension
 */
chrome.webNavigation.onCommitted.addListener((details) => {
  if (["reload"].includes(details.transitionType)) {
    chrome.webNavigation.onCompleted.addListener(function onComplete({
      tabId,
      url,
    }) {
      onPageLoad(tabId, url);
      chrome.webNavigation.onCompleted.removeListener(onComplete);
    });
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
  } else if (message.manageGoogleActivity) {
    const { historyWatchTime } = message.manageGoogleActivity;
    manageGoogleActivity(historyWatchTime).then(() => {
      sendResponse({ isSuccess: true });
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
