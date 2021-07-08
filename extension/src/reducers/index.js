import {
  SET_AUTHENTICATION_PROGRESS,
  RESET_HISTORY_MONITOR,
  SET_SIGNED_IN_STATUS,
  START_HISTORY_MONITOR,
  TURN_OFF_EXTENSION,
  TURN_ON_EXTENSION,
  UPDATE_TAGGED_PERSON_URLS,
  RESET_AUTHENTICATION_PROGRESS,
} from "GlobalActionTypes";

const defaultState = {
  isSignedIn: false,
  isExtensionActive: true,
  startHistoryMonitor: false,
  updateTaggedUrls: null,
  authProgress: null,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_SIGNED_IN_STATUS:
      return {
        ...state,
        isSignedIn: action.isSignedIn,
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
    case RESET_HISTORY_MONITOR:
      return {
        ...state,
        startHistoryMonitor: false,
      };
    case UPDATE_TAGGED_PERSON_URLS:
      return {
        ...state,
        updateTaggedUrls: action.data,
      };
    case SET_AUTHENTICATION_PROGRESS:
      return {
        ...state,
        authProgress: action.data,
      };
    case RESET_AUTHENTICATION_PROGRESS:
      return {
        ...state,
        authProgress: null,
      };
    default:
      return defaultState;
  }
};

export default reducer;
