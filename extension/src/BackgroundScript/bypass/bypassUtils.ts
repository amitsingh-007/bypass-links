import { VoidFunction } from '@bypass/shared/interfaces/custom';
import { BYPASS_KEYS } from '@constants/index';
import scripting from '@helpers/chrome/scripting';
import tabs from '@helpers/chrome/tabs';
import { getHostnameAlias } from '@/utils/common';
import { IBypass } from '../interfaces/bypass';
import { bypassBonsai } from './bypassBonsai';
import { bypassBonsaiLink } from './bypassBonsaiLink';
import { bypassForums } from './bypassForums';
import { bypassLinkvertise } from './bypassLinkvertise';
import { bypassMedium } from './bypassMedium';
import { bypassPageLinks } from './bypassPageLinks';

export const bypassSingleLinkOnPage = async (
  selectorFn: VoidFunction,
  tabId: number
) => {
  const response = await scripting.executeScript({
    target: { tabId },
    func: selectorFn,
  });
  const result: { links: string[] } | null = response[0].result;
  const targetUrl = result?.links?.[0];
  if (targetUrl) {
    tabs.update(tabId, { url: targetUrl });
  }
};

export const getDecodedBypass = (bypass: IBypass) =>
  bypass &&
  Object.entries(bypass).reduce<IBypass>((obj, [key, value]) => {
    obj[decodeURIComponent(atob(key))] = value;
    return obj;
  }, {});

const bypassAndHostnameMapping = {
  [BYPASS_KEYS.LINKVERTISE]: bypassLinkvertise,
  [BYPASS_KEYS.BONSAI]: bypassBonsai,
  [BYPASS_KEYS.BONSAILINK]: bypassBonsaiLink,
  [BYPASS_KEYS.FORUMS]: bypassForums,
  [BYPASS_KEYS.FORUMS_V2]: bypassForums,
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
  if (url.hostname.includes('medium.com')) {
    return bypassAndHostnameMapping.MEDIUM;
  }
  return null;
};
