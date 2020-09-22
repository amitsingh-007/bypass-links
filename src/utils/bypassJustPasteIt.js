import { JSDOM } from "jsdom";
import validUrl from "valid-url";
import { getJustPasteItPage } from "../apis/justPasteIt";
import { HOSTNAME } from "../constants";

const getTargetPageUrl = (html) => {
  const { document } = new JSDOM(html).window;
  const selectedAnchors = document.getElementsByTagName("A");
  return [...selectedAnchors]
    .filter((anchor) => validUrl.isUri(anchor.textContent))
    .map((anchor) => new URL(anchor.textContent))
    .filter((anchor) => anchor.hostname === HOSTNAME.MEGA_NZ);
};

export const bypassJustPasteIt = async (url) => {
  const responseHTML = await getJustPasteItPage();
  const targetLinks = getTargetPageUrl(responseHTML);
  return targetLinks && targetLinks.length === 1 ? targetLinks[1].href : null;
};
