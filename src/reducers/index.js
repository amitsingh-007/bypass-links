import {
  HIDE_EDIT_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_EDIT_PANEL,
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
    default:
      return defaultState;
  }
};

export default reducer;
