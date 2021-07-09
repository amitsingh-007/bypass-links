import { DISPLAY_TOAST, HIDE_TOAST } from "GlobalActionTypes/toast";
import { ToastAction, ToastState } from "./interfaces/toast";

const defaultState = {
  message: null,
};

const toastReducer = (
  state: ToastState = defaultState,
  action: ToastAction
): ToastState => {
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
