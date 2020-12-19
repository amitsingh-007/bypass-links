import { getCurrentTab } from "ChromeApi/tabs";
import { FIREBASE_DB_REF } from "GlobalConstants/index";
import md5 from "md5";
import { changeTabUrl } from "./bypass/changeTabUrl";
import {
  copyToFallbackDB,
  getByKey,
  removeFromFirebase,
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

export const getMappedRedirections = (redirections) =>
  redirections
    ? redirections.reduce((obj, { alias, website }) => {
        obj[alias] = website;
        return obj;
      }, {})
    : null;

export const getBookmark = async () => {
  const [{ url }] = await getCurrentTab();
  return getByKey(FIREBASE_DB_REF.bookmarks, md5(url));
};

export const saveBookmark = async (bookmark) => {
  await copyToFallbackDB(
    FIREBASE_DB_REF.bookmarks,
    FIREBASE_DB_REF.bookmarksFallback
  );
  return upateValueInFirebase(
    FIREBASE_DB_REF.bookmarks,
    md5(decodeURIComponent(atob(bookmark.url))),
    bookmark
  );
};

export const removeBookmark = async () => {
  const [{ url }] = await getCurrentTab();
  await copyToFallbackDB(
    FIREBASE_DB_REF.bookmarks,
    FIREBASE_DB_REF.bookmarksFallback
  );
  return removeFromFirebase(FIREBASE_DB_REF.bookmarks, md5(url));
};
