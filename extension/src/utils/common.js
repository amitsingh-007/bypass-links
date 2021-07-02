import storage from "ChromeApi/storage";
import { EXTENSION_STATE, STORAGE_KEYS } from "GlobalConstants";

export const getExtensionState = async () => {
  const { extState } = await storage.get(["extState"]);
  return extState;
};

export const isExtensionActive = (extState) =>
  extState === EXTENSION_STATE.ACTIVE;

export const setExtStateInStorage = (extState) => {
  storage.set({ extState }).then(() => {
    console.log(`ExtensionState in storage is set to ${extState}.`);
  });
};

const getHostnames = async () => {
  const { [STORAGE_KEYS.bypass]: bypass } = await storage.get([
    STORAGE_KEYS.bypass,
  ]);
  return bypass || {};
};

export const getHostnameAlias = async (hostname) => {
  const hostnames = await getHostnames();
  return hostnames[hostname];
};

export const matchHostnames = async (hostname, bypassKey) =>
  (await getHostnameAlias(hostname)) === bypassKey;
