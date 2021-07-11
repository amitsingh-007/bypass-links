import storage from "ChromeApi/storage";
import { EXTENSION_STATE, STORAGE_KEYS } from "GlobalConstants";
import { getHostnames } from "SrcPath/helpers/fetchFromStorage";

export const isExtensionActive = (extState: EXTENSION_STATE) =>
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

export const matchHostnames = async (hostname: string, bypassKey: string) =>
  (await getHostnameAlias(hostname)) === bypassKey;
