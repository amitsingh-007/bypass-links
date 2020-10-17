import { HOSTNAME, MEDIUM_HOMEPAGE, MEDIUM_WHITELISTED } from "../constants";

const shouldSkipBypassingMedium = (url, searchParams) =>
  url === MEDIUM_HOMEPAGE ||
  MEDIUM_WHITELISTED.find((link) => url.includes(link)) ||
  searchParams.get("source");

const shouldBypass = () => {
  return {
    hasPaywall: !!document.getElementById("paywall-background-color"),
  };
};

export const bypassMedium = async (url, tabId) => {
  if (!url.hostname.includes(HOSTNAME.MEDIUM)) {
    return;
  }
  const onIncognitoOpenCallback = () => {
    chrome.tabs.goBack(tabId);
  };

  if (shouldSkipBypassingMedium(url.href, url.searchParams)) {
    return;
  }

  chrome.tabs.executeScript(
    tabId,
    {
      code: `(${shouldBypass})()`,
      runAt: "document_end",
    },
    ([result] = []) => {
      // shown in devtools of the popup window
      if (!chrome.runtime.lastError) {
        if (result && result.hasPaywall) {
          chrome.windows.create(
            {
              url: url.href,
              state: "maximized",
              incognito: true,
            },
            onIncognitoOpenCallback
          );
        }
      } else {
        console.log(
          "Error in bypassing medium, not retrying.",
          chrome.runtime.lastError
        );
      }
    }
  );
};
