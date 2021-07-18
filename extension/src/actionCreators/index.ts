import { SET_SIGNED_IN_STATUS } from "GlobalActionTypes";

export const setSignedInStatus = (isSignedIn: boolean) => ({
  type: SET_SIGNED_IN_STATUS,
  isSignedIn,
});
