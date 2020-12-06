import { changeTabUrl } from "./bypass/changeTabUrl";

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
