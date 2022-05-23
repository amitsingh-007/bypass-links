import { bypassSingleLinkOnPage } from '../bypass/bypassUtils';

const findMegaLinks = () => {
  const LINKS_TO_BYPASS = ['mega.nz', 'drive.google.com'];

  const anchorTagsOnPage = document.getElementsByTagName('a');
  const links = [...anchorTagsOnPage]
    .map((anchor) => [anchor.innerText.trim(), anchor.href.trim()])
    .flat(2);
  const uniqueLinks = Array.from(new Set(links));
  const validLinks = uniqueLinks.filter(
    (url) =>
      /(http(s?)):\/\//i.test(url) &&
      LINKS_TO_BYPASS.includes(new URL(url).hostname)
  );

  return { links: validLinks };
};

export const bypassPageLinks = async (_url: URL, tabId: number) => {
  await bypassSingleLinkOnPage(findMegaLinks, tabId);
};
