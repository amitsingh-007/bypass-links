import storage from "ChromeApi/storage";
import { EXTENSION_STATE } from "GlobalConstants/index";

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
