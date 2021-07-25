import { BYPASS_KEYS } from "GlobalConstants";
import scripting from "GlobalHelpers/chrome/scripting";
import tabs from "GlobalHelpers/chrome/tabs";
import { getHostnameAlias } from "GlobalUtils/common";
import { bypassBonsai } from "./bypassBonsai";
import { bypassBonsaiLink } from "./bypassBonsaiLink";
import { bypassForums } from "./bypassForums";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { bypassMedium } from "./bypassMedium";
import { bypassPageLinks } from "./bypassPageLinks";

export const bypassSingleLinkOnPage = async (
  selectorFn: () => void,
  tabId: number
) => {
  const response = await scripting.executeScript({
    target: { tabId },
    function: selectorFn,
  });
  const result: { links: string[] } | null = response[0].result;
  const targetUrl = result?.links?.[0];
  if (targetUrl) {
    tabs.update(tabId, { url: targetUrl });
  }
};

const bypassAndHostnameMapping = {
  [BYPASS_KEYS.LINKVERTISE]: bypassLinkvertise,
  [BYPASS_KEYS.BONSAI]: bypassBonsai,
  [BYPASS_KEYS.BONSAILINK]: bypassBonsaiLink,
  [BYPASS_KEYS.FORUMS]: bypassForums,
  [BYPASS_KEYS.JUSTPASTEIT]: bypassPageLinks,
  [BYPASS_KEYS.PASTELINK]: bypassPageLinks,
  [BYPASS_KEYS.RENTRY]: bypassPageLinks,
  [BYPASS_KEYS.MEDIUM]: bypassMedium,
} as Record<BYPASS_KEYS, (url: URL, tabId: number) => Promise<void>>;

export const getBypassExecutor = async (url: URL) => {
  const hostnameAlias = await getHostnameAlias(url.hostname);
  if (bypassAndHostnameMapping[hostnameAlias]) {
    return bypassAndHostnameMapping[hostnameAlias];
  }
  if (url.hostname.includes("medium.com")) {
    return bypassAndHostnameMapping.MEDIUM;
  }
  return null;
};
