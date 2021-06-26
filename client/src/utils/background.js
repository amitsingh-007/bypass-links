import action from "ChromeApi/action";
import scripting from "ChromeApi/scripting";
import tabs, { getCurrentTab } from "ChromeApi/tabs";
import { getExtensionState, isExtensionActive } from "./common";

export const bypassSingleLinkOnPage = async (selectorFn, tabId) => {
  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    function: selectorFn,
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
  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    function: getForumPageLinksFunc,
  });
  return new Promise((resolve, reject) => {
    resolve(result);
  });
};

const getPageH1 = () => {
  const h1s = document.getElementsByTagName("h1");
  return h1s.length > 0 ? h1s[0].innerText : "";
};
export const fetchPageH1 = async () => {
  const { id: tabId } = await getCurrentTab();
  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    function: getPageH1,
  });
  return new Promise((resolve, reject) => {
    resolve(result);
  });
};

export const isValidUrl = (url) =>
  url && !/chrome(-extension)?:\/\/*/.test(url);

export const setExtensionIcon = async ({
  extState,
  hasPendingBookmarks,
  hasPendingPersons,
}) => {
  let icon;
  if (hasPendingBookmarks === true || hasPendingPersons === true) {
    icon = "assets/bypass_link_pending_128.png";
  } else {
    const newExtState = extState ?? (await getExtensionState());
    icon = isExtensionActive(newExtState)
      ? "assets/bypass_link_on_128.png"
      : "assets/bypass_link_off_128.png";
  }
  await action.setIcon({ path: icon });
};
