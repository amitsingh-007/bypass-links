import {
  HIDE_QUICK_BOOKMARK_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_QUICK_BOOKMARK_PANEL,
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

export const showQuickBookmarkPanel = (bookmark) => {
  return {
    type: SHOW_QUICK_BOOKMARK_PANEL,
    bookmark,
  };
};

export const hideQuickBookmarkPanel = () => ({
  type: HIDE_QUICK_BOOKMARK_PANEL,
});
