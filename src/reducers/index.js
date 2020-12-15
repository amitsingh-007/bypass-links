import { TURN_ON_EXTENSION } from "GlobalActionTypes/";
import { START_HISTORY_MONITOR } from "GlobalActionTypes/";
import { TURN_OFF_EXTENSION } from "GlobalActionTypes/";
import {
  HIDE_EDIT_PANEL,
  HIDE_MANUAL_HISTORY_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_EDIT_PANEL,
  SHOW_MANUAL_HISTORY_PANEL,
} from "GlobalActionTypes/";

const defaultState = {
  isSignedIn: false,
  showEditPanel: false,
  isExtensionActive: true,
  startHistoryMonitor: false,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_SIGNED_IN_STATUS:
      return {
        ...state,
        isSignedIn: action.isSignedIn,
      };
    case SHOW_EDIT_PANEL:
      return {
        ...state,
        showEditPanel: true,
      };
    case HIDE_EDIT_PANEL:
      return {
        ...state,
        showEditPanel: false,
      };
    case SHOW_MANUAL_HISTORY_PANEL:
      return {
        ...state,
        showManualHistoryPanel: true,
      };
    case HIDE_MANUAL_HISTORY_PANEL:
      return {
        ...state,
        showManualHistoryPanel: false,
      };
    case TURN_OFF_EXTENSION:
      return {
        ...state,
        isExtensionActive: false,
      };
    case TURN_ON_EXTENSION:
      return {
        ...state,
        isExtensionActive: true,
      };
    case START_HISTORY_MONITOR:
      return {
        ...state,
        startHistoryMonitor: true,
      };
    default:
      return defaultState;
  }
};

export default reducer;
