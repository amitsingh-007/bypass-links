import { EXTENSION_STATE } from "../constants";
import storage from "../scripts/chrome/storage";

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
