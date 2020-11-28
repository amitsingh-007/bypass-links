import { EXTENSION_STATE } from "../constants";
import storage from "../scripts/chrome/storage";

export const setExtStateInStorage = (extState) => {
  storage.set({ extState }).then(() => {
    console.log(`ExtensionState in storage is set to ${extState}.`);
  });
};

const getExtensionState = async () => {
  const { extState } = await storage.get(["extState"]);
  return extState;
};

export const isExtensionActive = async () =>
  (await getExtensionState()) === EXTENSION_STATE.ACTIVE;

export const toggleExtension = async () => {
  const newExtensionState = (await isExtensionActive())
    ? EXTENSION_STATE.INACTIVE
    : EXTENSION_STATE.ACTIVE;
  setExtStateInStorage(newExtensionState);
  return newExtensionState;
};
