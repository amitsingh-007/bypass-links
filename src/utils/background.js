import tabs, { getCurrentTab } from "ChromeApi/tabs";

export const bypassSingleLinkOnPage = (selectorFn, tabId) => {
  tabs
    .executeScript(tabId, {
      code: `(${selectorFn})()`,
      runAt: "document_end",
    })
    .then(([result] = []) => {
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
    });
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
  const [{ id: tabId }] = await getCurrentTab();
  const [results] = await tabs.executeScript(tabId, {
    code: `(${getPageH1})()`,
  });
  return new Promise((resolve, reject) => {
    resolve(results);
  });
};

export const isValidUrl = (url) =>
  url && !/chrome(-extension)?:\/\/*/.test(url);
