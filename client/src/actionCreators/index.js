import {
  DISPLAY_TOAST,
  HIDE_TOAST,
  RESET_HISTORY_MONITOR,
  SET_SIGNED_IN_STATUS,
  START_HISTORY_MONITOR,
  TURN_OFF_EXTENSION,
  TURN_ON_EXTENSION,
} from "GlobalActionTypes/index";

export const setSignedInStatus = (isSignedIn) => ({
  type: SET_SIGNED_IN_STATUS,
  isSignedIn,
});

export const turnOffExtension = () => ({
  type: TURN_OFF_EXTENSION,
});

export const turnOnExtension = () => ({
  type: TURN_ON_EXTENSION,
});

export const startHistoryMonitor = () => ({
  type: START_HISTORY_MONITOR,
});

export const resetHistoryMonitor = () => ({
  type: RESET_HISTORY_MONITOR,
});

export const displayToast = ({
  message,
  severity = "info",
  duration = 3000,
}) => ({
  type: DISPLAY_TOAST,
  message,
  severity,
  duration,
});

export const hideToast = () => ({
  type: HIDE_TOAST,
});
