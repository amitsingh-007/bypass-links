import { DISPLAY_TOAST, HIDE_TOAST } from "GlobalActionTypes/toast";

const defaultState = null;

const toastReducer = (state = defaultState, action) => {
  switch (action.type) {
    case DISPLAY_TOAST:
      return {
        ...state,
        message: action.message,
        severity: action.severity,
        duration: action.duration,
      };
    case HIDE_TOAST:
    default:
      return defaultState;
  }
};

export default toastReducer;
