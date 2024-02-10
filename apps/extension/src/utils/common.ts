import { EBypassKeys, EExtensionState } from '@constants/index';
import { getHostnames } from '@helpers/fetchFromStorage';

export const getIsExtensionActive = (extState: EExtensionState) =>
  extState === EExtensionState.ACTIVE;

export const setExtStateInStorage = (extState: EExtensionState) => {
  chrome.storage.local.set({ extState }).then(() => {
    console.log(`ExtensionState in storage is set to ${extState}.`);
  });
};

export const getHostnameAlias = async (hostname: string) => {
  const hostnames = await getHostnames();
  return hostnames[hostname];
};

export const matchHostnames = async (
  hostname: string,
  bypassKey: EBypassKeys
) => (await getHostnameAlias(hostname)) === bypassKey;
