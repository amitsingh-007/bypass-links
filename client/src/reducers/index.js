import {
  DISPLAY_TOAST,
  HIDE_TOAST,
  RESET_HISTORY_MONITOR,
  SET_SIGNED_IN_STATUS,
  START_HISTORY_MONITOR,
  TURN_OFF_EXTENSION,
  TURN_ON_EXTENSION,
} from "GlobalActionTypes/index";

const defaultState = {
  isSignedIn: false,
  isExtensionActive: true,
  startHistoryMonitor: false,
  toast: null,
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
    case DISPLAY_TOAST:
      return {
        ...state,
        toast: {
          message: action.message,
          severity: action.severity,
          duration: action.duration,
        },
      };
    case HIDE_TOAST:
      return {
        ...state,
        toast: null,
      };
    default:
      return defaultState;
  }
};

export default reducer;
