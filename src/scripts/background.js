import { EXTENSION_STATE, FIREBASE_DB_REF } from "GlobalConstants/index";
import { signIn, signOut } from "GlobalUtils/authentication";
import {
  addBookmark,
  isBookmarked,
  removeBookmark,
  saveDataToFirebase,
} from "GlobalUtils/background";
import { bypass, redirect } from "GlobalUtils/bypass";
import {
  getExtensionState,
  isExtensionActive,
  setExtStateInStorage,
} from "GlobalUtils/common";
import { getDefaultsFromFirebase, getFromFirebase } from "GlobalUtils/firebase";
import { syncFirebaseToStorage } from "GlobalUtils/syncFirebaseToStorage";

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
  syncFirebaseToStorage();
};

const onMessageReceive = (message, sender, sendResponse) => {
  if (message.triggerSignIn) {
    signIn().then((isSignedIn) => {
      sendResponse({ isSignedIn });
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
    saveDataToFirebase(
      message.saveRedirectionRules,
      FIREBASE_DB_REF.redirections,
      FIREBASE_DB_REF.redirectionsFallback,
      syncFirebaseToStorage
    ).then((isRuleSaveSuccess) => {
      sendResponse({ isRuleSaveSuccess });
    });
  } else if (message.getDefaults) {
    getDefaultsFromFirebase(FIREBASE_DB_REF.redirections).then((snapshot) => {
      sendResponse({ defaults: snapshot.val() });
    });
  } else if (message.isBookmarked) {
    isBookmarked().then((snapshot) => {
      sendResponse({ isBookmarked: snapshot.exists() });
    });
  } else if (message.addBookmark) {
    addBookmark().then(() => {
      sendResponse({ isBookmarkAdded: true });
    });
  } else if (message.removeBookmark) {
    removeBookmark().then(() => {
      sendResponse({ isBookmarkRemoved: true });
    });
  } else if (message.getBookmarks) {
    getFromFirebase(FIREBASE_DB_REF.bookmarks).then((snapshot) => {
      sendResponse({ bookmarks: snapshot.val() });
    });
  } else if (message.saveBookmarks) {
    saveDataToFirebase(
      message.saveBookmarks,
      FIREBASE_DB_REF.bookmarks,
      FIREBASE_DB_REF.bookmarksFallback,
      sendResponse
    ).then((isBookmarksSaveSuccess) => {
      sendResponse({ isBookmarksSaveSuccess });
    });
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
