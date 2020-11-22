import { EXTENSION_STATE, FIREBASE_DB_REF } from "../constants";
import { signIn, signOut } from "../utils/authentication";
import { bypass, redirect } from "../utils/bypass";
import { isExtensionActive } from "../utils/extensionIndex";
import { getFromFirebase, saveToFirebase } from "../utils/firebase";
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

const saveDataToFirebase = (data, sendResponse) => {
  let isRuleSaveSuccess = false;
  saveToFirebase(FIREBASE_DB_REF.redirections, data)
    .then(() => {
      isRuleSaveSuccess = true;
      syncFirebaseToStorage();
    })
    .catch((err) => {
      console.log("Error while saving data to Firebase", err);
    })
    .finally(() => {
      sendResponse({ isRuleSaveSuccess });
    });
};

const onMessageReceive = (message, sender, sendResponse) => {
  if (message.triggerSignIn) {
    signIn().then((isAuthenticated) => {
      sendResponse({ isAuthenticated });
    });
  } else if (message.triggerSignOut) {
    signOut().then((isSignedOut) => {
      sendResponse({ isSignedOut });
    });
  } else if (message.getRedirections) {
    getFromFirebase(FIREBASE_DB_REF.redirections).then((snapshot) => {
      sendResponse({ redirections: snapshot.val() });
    });
  } else if (message.saveRedirectionRules) {
    saveDataToFirebase(message.saveRedirectionRules, sendResponse);
  }
  return true;
};

//Listen tab url change
chrome.tabs.onUpdated.addListener(onUpdateCallback);

//Listen key press for toggle
chrome.commands.onCommand.addListener(handleExtensionToggle);

//First time extension install
chrome.runtime.onInstalled.addListener(handleFirstTimeInstall);

//Listen to dispatched messages
chrome.runtime.onMessage.addListener(onMessageReceive);
