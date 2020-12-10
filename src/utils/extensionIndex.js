import { FIREBASE_DB_REF } from "GlobalConstants/";
import { changeTabUrl } from "./bypass/changeTabUrl";
import { getFromFirebase, saveToFirebase } from "./firebase";
import { syncFirebaseToStorage } from "./syncFirebaseToStorage";

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
export const saveDataToFirebase = (data, sendResponse) => {
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
