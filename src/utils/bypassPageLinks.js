import { changeTabUrl } from "./changeTabUrl";

const findMegaLinks = () => {
  const LINKS_TO_BYPASS = ["mega.nz", "drive.google.com"];

  const anchorTagsOnPage = document.getElementsByTagName("a");
  const links = [...anchorTagsOnPage]
    .map((anchor) => [anchor.innerText.trim(), anchor.href.trim()])
    .flat(Infinity);
  const uniqueLinks = Array.from(new Set(links));
  const validLinks = uniqueLinks.filter(
    (url) =>
      /(http(s?)):\/\//i.test(url) &&
      LINKS_TO_BYPASS.includes(new URL(url).hostname)
  );

  return {
    links: validLinks,
  };
};

export const bypassPageLinks = (tabId) => {
  chrome.tabs.executeScript(
    tabId,
    {
      code: `(${findMegaLinks})()`,
      runAt: "document_end",
    },
    ([result] = []) => {
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
          bypassPageLinks(tabId);
        }, 1000);
      }
    }
  );
};
