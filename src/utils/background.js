import { getCurrentTab } from "ChromeApi/tabs";
import { FIREBASE_DB_REF } from "GlobalConstants/index";
import md5 from "md5";
import { changeTabUrl } from "./bypass/changeTabUrl";
import {
  copyToFallbackDB,
  getFromFirebase,
  removeFromFirebase,
  saveToFirebase,
  searchOnKey,
  upateValueInFirebase,
} from "./firebase";

export const bypassSingleLinkOnPage = (selectorFn, tabId) => {
  chrome.tabs.executeScript(
    tabId,
    {
      code: `(${selectorFn})()`,
      runAt: "document_end",
    },
    ([result] = []) => {
      console.log("inside bypassSingleLinkOnPage", result);
      // shown in devtools of the popup window
      if (!chrome.runtime.lastError) {
        const targetUrl =
          result && result.links && result.links.length === 1
            ? result.links[0]
            : null;
        changeTabUrl(tabId, targetUrl);
      } else {
        console.log("Error", chrome.runtime.lastError);
        setTimeout(() => {
          bypassSingleLinkOnPage(tabId);
        }, 1000);
      }
    }
  );
};

/**
 * We first update the fallback db with current data and then update the current db
 */
export const saveDataToFirebase = async (
  data,
  ref,
  fallbackDbRef,
  successCallback
) => {
  await copyToFallbackDB(ref, fallbackDbRef);
  return new Promise((resolve, reject) => {
    saveToFirebase(ref, data)
      .then(() => {
        if (syncFirebaseToStorage) {
          successCallback();
        }
        resolve(true);
      })
      .catch((err) => {
        console.log(`Error while saving data to Firebase db: ${ref}`, err);
        resolve(false);
      });
  });
};

export const getMappedRedirections = (redirections) =>
  redirections
    ? redirections.reduce((obj, { alias, website }) => {
        obj[alias] = website;
        return obj;
      }, {})
    : null;

export const isBookmarked = async () => {
  const [currentTab] = await getCurrentTab();
  return searchOnKey(FIREBASE_DB_REF.bookmarks, md5(currentTab.url));
};

export const addBookmark = async () => {
  const [currentTab] = await getCurrentTab();
  const url = currentTab.url;
  const value = { url: btoa(url) };
  await copyToFallbackDB(
    FIREBASE_DB_REF.bookmarks,
    FIREBASE_DB_REF.bookmarksFallback
  );
  return upateValueInFirebase(FIREBASE_DB_REF.bookmarks, md5(url), value);
};

export const removeBookmark = async () => {
  const [currentTab] = await getCurrentTab();
  await copyToFallbackDB(
    FIREBASE_DB_REF.bookmarks,
    FIREBASE_DB_REF.bookmarksFallback
  );
  return removeFromFirebase(FIREBASE_DB_REF.bookmarks, md5(currentTab.url));
};
