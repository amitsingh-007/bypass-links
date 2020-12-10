import { HOSTNAME } from "GlobalConstants/";
import { bypassSingleLinkOnPage } from "GlobalUtils/extensionIndex";

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

  return { links: validLinks };
};

export const bypassPageLinks = async (url, tabId) => {
  if (
    url.hostname !== HOSTNAME.PASTELINK &&
    url.hostname !== HOSTNAME.JUSTPASTEIT &&
    url.hostname !== HOSTNAME.RENTRY
  ) {
    return;
  }
  bypassSingleLinkOnPage(findMegaLinks, tabId);
};
