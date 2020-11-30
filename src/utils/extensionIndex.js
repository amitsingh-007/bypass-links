import storage from "../scripts/chrome/storage";
import { changeTabUrl } from "./bypass/changeTabUrl";
import history from "../scripts/chrome/history";

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

export const startHistoryWatch = () =>
  storage.set({ historyStartTime: Date.now() });

export const endHistoryWatch = () =>
  new Promise((resolve, reject) => {
    storage.get(["historyStartTime"]).then(({ historyStartTime }) => {
      const historyEndTime = Date.now();
      console.log(`Start DateTime is: ${new Date(historyStartTime)}`);
      console.log(`End DateTime is: ${new Date(historyEndTime)}`);
      history
        .deleteRange({
          startTime: historyStartTime,
          endTime: historyEndTime,
        })
        .then(() => {
          storage.remove("historyStartTime");
          console.log("History clear succesful.");
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  });
