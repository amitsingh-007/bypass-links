import {
  HIDE_EDIT_PANEL,
  HIDE_MANUAL_HISTORY_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_EDIT_PANEL,
  SHOW_MANUAL_HISTORY_PANEL,
} from "../actionType";

const defaultState = {
  isSignedIn: false,
  showEditPanel: false,
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
    default:
      return defaultState;
  }
};

export default reducer;
