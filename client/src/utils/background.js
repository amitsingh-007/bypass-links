import tabs, { getCurrentTab } from "ChromeApi/tabs";
import { getExtensionState, isExtensionActive } from "./common";

export const bypassSingleLinkOnPage = async (selectorFn, tabId) => {
  const [result] = await tabs.executeScript(tabId, {
    code: `(${selectorFn})()`,
    runAt: "document_end",
  });
  const targetUrl = result?.links?.[0] ?? null;
  tabs.update(tabId, { url: targetUrl });
};

const getForumPageLinksFunc = () => {
  const unreadRows = document.querySelectorAll(
    ".block-row.block-row--separated:not(.block-row--alt)"
  );
  return [...unreadRows].map(
    (row) => row.querySelector("a.fauxBlockLink-blockLink").href
  );
};
export const getForumPageLinks = async (tabId) => {
  const [results] = await tabs.executeScript(tabId, {
    code: `(${getForumPageLinksFunc})()`,
  });
  return new Promise((resolve, reject) => {
    resolve(results);
  });
};

const getPageH1 = () => {
  const h1s = document.getElementsByTagName("h1");
  return h1s.length > 0 ? h1s[0].innerText : "";
};
export const fetchPageH1 = async () => {
  const { id: tabId } = await getCurrentTab();
  const [results] = await tabs.executeScript(tabId, {
    code: `(${getPageH1})()`,
  });
  return new Promise((resolve, reject) => {
    resolve(results);
  });
};

export const isValidUrl = (url) =>
  url && !/chrome(-extension)?:\/\/*/.test(url);

export const getExtensionIcon = async (
  extState,
  hasPendingBookmarks,
  hasPendingPersons
) => {
  let icon;
  if (
    hasPendingBookmarks?.newValue === true ||
    hasPendingPersons?.newValue === true
  ) {
    icon = "bypass_link_pending_128.png";
  } else {
    const newExtState = extState?.newValue ?? (await getExtensionState());
    icon = isExtensionActive(newExtState)
      ? "bypass_link_on_128.png"
      : "bypass_link_off_128.png";
  }
  return Promise.resolve(icon);
};
