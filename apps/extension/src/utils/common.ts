import { EExtensionState } from '../constants/index';

export const getIsExtensionActive = (extState: EExtensionState) =>
  extState === EExtensionState.ACTIVE;
