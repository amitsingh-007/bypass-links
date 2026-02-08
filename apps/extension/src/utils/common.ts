import { EExtensionState } from '../constants/index';

export const getIsExtensionActive = (extState: EExtensionState) =>
  extState === EExtensionState.ACTIVE;

export const setExtStateInStorage = (extState: EExtensionState) => {
  browser.storage.local.set({ extState });
};
