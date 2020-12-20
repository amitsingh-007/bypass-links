import { TURN_ON_EXTENSION } from "GlobalActionTypes/index";
import { HIDE_BOOKMARKS_PANEL } from "GlobalActionTypes/index";
import { SHOW_QUICK_BOOKMARK_PANEL } from "GlobalActionTypes/index";
import { HIDE_QUICK_BOOKMARK_PANEL } from "GlobalActionTypes/index";
import { SHOW_BOOKMARKS_PANEL } from "GlobalActionTypes/index";
import { START_HISTORY_MONITOR } from "GlobalActionTypes/index";
import { TURN_OFF_EXTENSION } from "GlobalActionTypes/index";
import {
  HIDE_EDIT_PANEL,
  HIDE_MANUAL_HISTORY_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_EDIT_PANEL,
  SHOW_MANUAL_HISTORY_PANEL,
} from "GlobalActionTypes/index";

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

export const turnOffExtension = () => ({
  type: TURN_OFF_EXTENSION,
});

export const turnOnExtension = () => ({
  type: TURN_ON_EXTENSION,
});

export const startHistoryMonitor = () => ({
  type: START_HISTORY_MONITOR,
});

export const showBookmarksPanel = () => ({
  type: SHOW_BOOKMARKS_PANEL,
});

export const hideBookmarksPanel = () => ({
  type: HIDE_BOOKMARKS_PANEL,
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
