import { EXTENSION_STATE, FIREBASE_DB_REF } from "../constants";
import { signIn, signOut } from "../utils/authentication";
import {
  isExtensionActive,
  toggleExtension,
  setExtStateInStorage,
} from "../utils/toggleExtension";
import { bypass, redirect } from "../utils/bypass";
import { getFromFirebase, saveToFirebase } from "../utils/firebase";
import { showToast } from "../utils/showToast";
import { syncFirebaseToStorage } from "../utils/syncFirebaseToStorage";

const onUpdateCallback = (tabId, changeInfo) => {
  const { url } = changeInfo;
  if (url && isExtensionActive()) {
    const currentTabUrl = new URL(url);
    bypass(tabId, currentTabUrl);
    redirect(tabId, currentTabUrl);
  }
};

const handleKeyPress = async (command) => {
  if (command === "toggle_bypass_links_extension") {
    const newExtensionState = await toggleExtension();
    showToast(newExtensionState);
  }
};

const handleFirstTimeInstall = () => {
  setExtStateInStorage(EXTENSION_STATE.ACTIVE);
  syncFirebaseToStorage();
};

/**
 * We first update the fallback db with current data and then update the current db
 */
const saveDataToFirebase = (data, sendResponse) => {
  let isRuleSaveSuccess = false;
  getFromFirebase(FIREBASE_DB_REF.redirections).then((snapshot) => {
    saveToFirebase(FIREBASE_DB_REF.redirectionsFallback, snapshot.val()).then(
      () => {
        console.log("Fallback DB updated.");
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
      }
    );
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
chrome.commands.onCommand.addListener(handleKeyPress);

//First time extension install
chrome.runtime.onInstalled.addListener(handleFirstTimeInstall);

//Listen to dispatched messages
chrome.runtime.onMessage.addListener(onMessageReceive);
