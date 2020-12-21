import tabs from "ChromeApi/tabs";

export const bypassSingleLinkOnPage = (selectorFn, tabId) => {
  chrome.scripting.executeScript(
    tabId,
    {
      function: selectorFn,
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
        tabs.update(tabId, { url: targetUrl });
      } else {
        console.log("Error", chrome.runtime.lastError);
        setTimeout(() => {
          bypassSingleLinkOnPage(tabId);
        }, 1000);
      }
    }
  );
};
