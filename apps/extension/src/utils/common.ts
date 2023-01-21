import {
  EXTENSION_STATE,
  IBypassKeys,
  IExtensionState,
} from '@constants/index';
import storage from '@helpers/chrome/storage';
import { getHostnames } from '@helpers/fetchFromStorage';

export const getIsExtensionActive = (extState: IExtensionState) =>
  extState === EXTENSION_STATE.ACTIVE;

export const setExtStateInStorage = (extState: IExtensionState) => {
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
  bypassKey: IBypassKeys
) => (await getHostnameAlias(hostname)) === bypassKey;
