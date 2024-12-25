import { EExtensionState } from '@constants/index';

export const getIsExtensionActive = (extState: EExtensionState) =>
  extState === EExtensionState.ACTIVE;

export const setExtStateInStorage = (extState: EExtensionState) => {
  chrome.storage.local.set({ extState }).then(() => {
    console.log(`ExtensionState in storage is set to ${extState}.`);
  });
};
