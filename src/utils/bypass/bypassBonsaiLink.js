import { bypassSingleLinkOnPage } from "GlobalUtils/background";

const findLinksOnPage = () => {
  const LINKS_TO_EXCLUDE = ["t.me"];

  const anchorTagsOnPage = document
    .getElementById("main")
    .getElementsByTagName("a");
  const links = [...anchorTagsOnPage].map((anchor) => anchor.href.trim());
  const uniqueLinks = Array.from(new Set(links));
  const validLinks = uniqueLinks.filter(
    (url) =>
      /(http(s?)):\/\//i.test(url) &&
      !LINKS_TO_EXCLUDE.includes(new URL(url).hostname)
  );

  return { links: validLinks };
};

export const bypassBonsaiLink = async (url, tabId) => {
  bypassSingleLinkOnPage(findLinksOnPage, tabId);
};
