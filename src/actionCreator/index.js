import {
  HIDE_EDIT_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_EDIT_PANEL,
} from "../actionType";

export const setSignedInStatus = (isSignedIn) => ({
  type: SET_SIGNED_IN_STATUS,
  isSignedIn,
});

export const showEditPanel = () => ({
  type: SHOW_EDIT_PANEL,
});

export const hideEditPanel = () => ({
  type: HIDE_EDIT_PANEL,
});
