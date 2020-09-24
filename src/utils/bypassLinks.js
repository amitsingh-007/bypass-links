import { HOSTNAME } from "../constants";
import { bypassBonsai } from "./bypassBonsai";
import { bypassPageLinks } from "./bypassPageLinks";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { changeTabUrl } from "./changeTabUrl";

export const bypassLink = async (tabId, url) => {
  const currentTabUrl = new URL(url);
  let targetUrl;
  //eslint-disable-next-line no-undef
  switch (currentTabUrl.hostname) {
    case HOSTNAME.LINKVERTISE:
      targetUrl = await bypassLinkvertise(currentTabUrl);
      break;
    case HOSTNAME.BONSAI:
      targetUrl = await bypassBonsai(currentTabUrl);
      break;
    case HOSTNAME.JUSTPASTEIT:
    case HOSTNAME.PASTELINK:
      bypassPageLinks(tabId);
      break;
    default:
      targetUrl = null;
  }
  await changeTabUrl(tabId, targetUrl);
};
