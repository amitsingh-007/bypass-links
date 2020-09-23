import { changeTabUrl } from "./changeTabUrl";

const findMegaLinks = () => {
  const selectedAnchors = document.getElementsByTagName("a");
  const links = [...selectedAnchors]
    .map((anchor) => anchor.innerText)
    .filter(
      (url) =>
        /(http(s?)):\/\//i.test(url) && new URL(url).hostname === "mega.nz"
    );
  return { links };
};

export const bypassJustPasteIt = (tabId) => {
  chrome.tabs.executeScript(
    {
      code: `(${findMegaLinks})()`,
    },
    ([result] = []) => {
      // shown in devtools of the popup window
      if (!chrome.runtime.lastError) {
        const targetUrl =
          result && result.links && result.links.length === 1
            ? result.links[0]
            : null;
        changeTabUrl(tabId, targetUrl);
      }
    }
  );
};
