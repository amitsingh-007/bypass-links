import { EBypassKeys } from '@/constants';
import { getHostnameAlias } from '@/utils/common';
import { IBypass } from '@bypass/shared';

export const getDecodedBypass = (bypass: IBypass) =>
  bypass &&
  Object.entries(bypass).reduce<IBypass>((obj, [key, value]) => {
    obj[decodeURIComponent(atob(key))] = value;
    return obj;
  }, {});

type IRedirectionMapping = Partial<
  Record<EBypassKeys, (url: URL, tabId: number) => Promise<void>>
>;

const bypassForums = async () => {};
const bypassAndHostnameMapping: IRedirectionMapping = {
  [EBypassKeys.FORUMS]: bypassForums,
};

export const getBypassExecutor = async (url: URL) => {
  const hostnameAlias = await getHostnameAlias(url.hostname);
  if (bypassAndHostnameMapping[hostnameAlias]) {
    return bypassAndHostnameMapping[hostnameAlias];
  }
  return null;
};
