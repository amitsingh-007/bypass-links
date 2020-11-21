import { EXTENSION_STATE } from "../constants";
import { signIn } from "../utils/authentication";
import { bypass, redirect } from "../utils/bypass";
import { isExtensionActive } from "../utils/extensionIndex";
import { showToast } from "../utils/showToast";
import { syncFirebaseToStorage } from "../utils/syncFirebaseToStorage";

const setExtStateInStorage = (extState) => {
  chrome.storage.sync.set({ extState }, () => {
    console.log(`ExtensionState in storage is set to ${extState}.`);
  });
};

let extensionState = EXTENSION_STATE.ACTIVE;
setExtStateInStorage(extensionState);

const onUpdateCallback = (tabId, changeInfo) => {
  const { url } = changeInfo;
  if (url && isExtensionActive(extensionState)) {
    const currentTabUrl = new URL(url);
    bypass(tabId, currentTabUrl);
    redirect(tabId, currentTabUrl);
  }
};

const handleExtensionToggle = (command) => {
  if (command === "toggle_bypass_links_extension") {
    const isCurrentlyActive = extensionState === EXTENSION_STATE.ACTIVE;
    extensionState = isCurrentlyActive
      ? EXTENSION_STATE.INACTIVE
      : EXTENSION_STATE.ACTIVE;
    showToast(extensionState);
    setExtStateInStorage(extensionState);
  }
};

const handleFirstTimeInstall = () => {
  syncFirebaseToStorage();
};

const onMessageReceive = (message, sender, sendResponse) => {
  console.log(message);
  const response = {};
  if (message.triggerSignIn) {
    const isSignInSuccess = signIn();
    response.isSignInSuccess = isSignInSuccess;
  }
  sendResponse(response);
};

//Listen tab url change
chrome.tabs.onUpdated.addListener(onUpdateCallback);

//Listen key press for toggle
chrome.commands.onCommand.addListener(handleExtensionToggle);

//First time extension install
chrome.runtime.onInstalled.addListener(handleFirstTimeInstall);

//Listen to dispatched messages
chrome.runtime.onMessage.addListener(onMessageReceive);
