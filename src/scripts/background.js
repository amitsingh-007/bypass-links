import { EXTENSION_STATE } from "GlobalConstants/index";
import { bypass } from "GlobalUtils/bypass/index";
import {
  getExtensionState,
  isExtensionActive,
  setExtStateInStorage,
} from "GlobalUtils/common";
import { redirect } from "GlobalUtils/redirect";

const onUpdateCallback = async (tabId, changeInfo) => {
  const { url } = changeInfo;
  const extState = await getExtensionState();
  if (url && isExtensionActive(extState)) {
    const currentTabUrl = new URL(url);
    bypass(tabId, currentTabUrl);
    redirect(tabId, currentTabUrl);
  }
};

const onFirstTimeInstall = () => {
  setExtStateInStorage(EXTENSION_STATE.ACTIVE);
};

const onMessageReceive = (message, sender, sendResponse) => {
  if (message.dummyMessage) {
    sendResponse({});
  }
  return true;
};

const onStorageChange = (changedObj, storageType) => {
  if (storageType !== "sync") {
    return;
  }
  const { extState } = changedObj;
  if (extState) {
    const icon = isExtensionActive(extState.newValue)
      ? "bypass_link_on_128.png"
      : "bypass_link_off_128.png";
    chrome.browserAction.setIcon({ path: icon });
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
