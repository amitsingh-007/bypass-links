import { getHostnameAlias } from '@/utils/common';
import { BYPASS_KEYS, IBypassKeys } from '@constants/index';
import { IBypass } from '../interfaces/bypass';
import { bypassForums } from './bypassForums';
import { bypassPageLinks } from './bypassPageLinks';

export const getDecodedBypass = (bypass: IBypass) =>
  bypass &&
  Object.entries(bypass).reduce<IBypass>((obj, [key, value]) => {
    obj[decodeURIComponent(atob(key))] = value;
    return obj;
  }, {});

type IRedirectionMapping = Partial<
  Record<IBypassKeys, (url: URL, tabId: number) => Promise<void>>
>;

const bypassAndHostnameMapping: IRedirectionMapping = {
  [BYPASS_KEYS.FORUMS]: bypassForums,
  [BYPASS_KEYS.FORUMS_V2]: bypassForums,
  [BYPASS_KEYS.JUSTPASTEIT]: bypassPageLinks,
  [BYPASS_KEYS.PASTELINK]: bypassPageLinks,
};

export const getBypassExecutor = async (url: URL) => {
  const hostnameAlias = await getHostnameAlias(url.hostname);
  if (bypassAndHostnameMapping[hostnameAlias]) {
    return bypassAndHostnameMapping[hostnameAlias];
  }
  return null;
};
