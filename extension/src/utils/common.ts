import storage from "GlobalHelpers/chrome/storage";
import { EXTENSION_STATE } from "GlobalConstants";
import { getHostnames } from "GlobalHelpers/fetchFromStorage";

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
