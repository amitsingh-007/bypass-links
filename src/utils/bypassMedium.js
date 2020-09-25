import { MEDIUM_HOMEPAGE } from "../constants";

const manipulateHistory = () => {
  window.history.back();
};

export const bypassMedium = (url, tabId) => {
  console.log("Url is : ", url);
  if (url.href === MEDIUM_HOMEPAGE || url.searchParams.get("source")) {
    return;
  }
  chrome.windows.create(
    {
      url: url.href,
      state: "maximized",
      incognito: true,
    },
    () => {
      chrome.tabs.goBack(tabId);
    }
  );
};
