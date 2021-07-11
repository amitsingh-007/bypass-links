import {
  TURN_OFF_EXTENSION,
  TURN_ON_EXTENSION,
} from "GlobalActionTypes/extension";
import { ExtensionAction, ExtensionState } from "./interfaces/extension";

const defaultState = {
  isExtensionActive: true,
};

const extensionReducer = (
  state: ExtensionState = defaultState,
  action: ExtensionAction
): ExtensionState => {
  switch (action.type) {
    case TURN_ON_EXTENSION:
      return {
        ...state,
        isExtensionActive: true,
      };
    case TURN_OFF_EXTENSION:
      return {
        ...state,
        isExtensionActive: false,
      };
    default:
      return defaultState;
  }
};

export default extensionReducer;
