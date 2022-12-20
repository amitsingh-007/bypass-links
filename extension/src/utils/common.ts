import storage from '@helpers/chrome/storage';
import { BYPASS_KEYS, EXTENSION_STATE } from '@constants/index';
import { getHostnames } from '@helpers/fetchFromStorage';

export const getIsExtensionActive = (extState: EXTENSION_STATE) =>
  extState === EXTENSION_STATE.ACTIVE;

export const setExtStateInStorage = (extState: EXTENSION_STATE) => {
  storage.set({ extState }).then(() => {
    console.log(`ExtensionState in storage is set to ${extState}.`);
  });
};

export const getHostnameAlias = async (hostname: string) => {
  const hostnames = await getHostnames();
  return hostnames[hostname];
};

export const matchHostnames = async (
  hostname: string,
  bypassKey: BYPASS_KEYS
) => (await getHostnameAlias(hostname)) === bypassKey;
