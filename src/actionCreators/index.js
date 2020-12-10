import {
  HIDE_EDIT_PANEL,
  HIDE_MANUAL_HISTORY_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_EDIT_PANEL,
  SHOW_MANUAL_HISTORY_PANEL
} from "GlobalActionTypes/";

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

export const showManualHistoryPanel = () => ({
  type: SHOW_MANUAL_HISTORY_PANEL,
});

export const hideManualHistoryPanel = () => ({
  type: HIDE_MANUAL_HISTORY_PANEL,
});
