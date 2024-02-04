import { getHostnameAlias } from '@/utils/common';
import { IBypass } from '@bypass/shared';
import { BYPASS_KEYS, IBypassKeys } from '@constants/index';

export const getDecodedBypass = (bypass: IBypass) =>
  bypass &&
  Object.entries(bypass).reduce<IBypass>((obj, [key, value]) => {
    obj[decodeURIComponent(atob(key))] = value;
    return obj;
  }, {});

type IRedirectionMapping = Partial<
  Record<IBypassKeys, (url: URL, tabId: number) => Promise<void>>
>;

const bypassForums = async () => {};
const bypassAndHostnameMapping: IRedirectionMapping = {
  [BYPASS_KEYS.FORUMS]: bypassForums,
};

export const getBypassExecutor = async (url: URL) => {
  const hostnameAlias = await getHostnameAlias(url.hostname);
  if (bypassAndHostnameMapping[hostnameAlias]) {
    return bypassAndHostnameMapping[hostnameAlias];
  }
  return null;
};
