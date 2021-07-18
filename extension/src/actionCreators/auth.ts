import {
  RESET_AUTHENTICATION_PROGRESS,
  SET_AUTHENTICATION_PROGRESS,
} from "GlobalActionTypes/auth";
import { AuthenticationEvent } from "GlobalInterfaces/authentication";
import { AuthAction } from "GlobalReducers/interfaces/auth";

export const setAuthenticationProgress = (
  data: AuthenticationEvent
): AuthAction => ({
  type: SET_AUTHENTICATION_PROGRESS,
  data,
});

export const resetAuthenticationProgress = (): Pick<AuthAction, "type"> => ({
  type: RESET_AUTHENTICATION_PROGRESS,
});
