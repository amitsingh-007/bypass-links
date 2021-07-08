import { AlertColor } from "@material-ui/core";
import {
  SET_AUTHENTICATION_PROGRESS,
  DISPLAY_TOAST,
  HIDE_TOAST,
  RESET_HISTORY_MONITOR,
  SET_SIGNED_IN_STATUS,
  START_HISTORY_MONITOR,
  TURN_OFF_EXTENSION,
  TURN_ON_EXTENSION,
  UPDATE_TAGGED_PERSON_URLS,
  RESET_AUTHENTICATION_PROGRESS,
} from "GlobalActionTypes";
import { AuthenticationEvent } from "GlobalInterfaces/authentication";
import { UpdateTaggedPersons } from "GlobalInterfaces/persons";

export const setSignedInStatus = (isSignedIn: boolean) => ({
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

export const updateTaggedPersonUrls = (data: UpdateTaggedPersons) => ({
  type: UPDATE_TAGGED_PERSON_URLS,
  data,
});

export const displayToast = ({
  message,
  severity = "info",
  duration = 3000,
}: {
  message: string;
  severity?: AlertColor;
  duration?: number;
}) => ({
  type: DISPLAY_TOAST,
  message,
  severity,
  duration,
});

export const hideToast = () => ({
  type: HIDE_TOAST,
});

export const setAuthenticationProgress = (data: AuthenticationEvent) => ({
  type: SET_AUTHENTICATION_PROGRESS,
  data,
});

export const resetAuthenticationProgress = () => ({
  type: RESET_AUTHENTICATION_PROGRESS,
});
