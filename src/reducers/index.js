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

const defaultState = {
  isSignedIn: false,
  showEditPanel: false,
  isExtensionActive: true,
  startHistoryMonitor: false,
  showBookmarksPanel: false,
  showQuickBookmarkPanel: {
    showPanel: false,
    bookmark: {},
  },
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_SIGNED_IN_STATUS:
      return {
        ...state,
        isSignedIn: action.isSignedIn,
      };
    case SHOW_EDIT_PANEL:
      return {
        ...state,
        showEditPanel: true,
      };
    case HIDE_EDIT_PANEL:
      return {
        ...state,
        showEditPanel: false,
      };
    case SHOW_MANUAL_HISTORY_PANEL:
      return {
        ...state,
        showManualHistoryPanel: true,
      };
    case HIDE_MANUAL_HISTORY_PANEL:
      return {
        ...state,
        showManualHistoryPanel: false,
      };
    case TURN_OFF_EXTENSION:
      return {
        ...state,
        isExtensionActive: false,
      };
    case TURN_ON_EXTENSION:
      return {
        ...state,
        isExtensionActive: true,
      };
    case START_HISTORY_MONITOR:
      return {
        ...state,
        startHistoryMonitor: true,
      };
    case SHOW_BOOKMARKS_PANEL:
      return {
        ...state,
        showBookmarksPanel: true,
      };
    case HIDE_BOOKMARKS_PANEL:
      return {
        ...state,
        showBookmarksPanel: false,
      };
    case SHOW_QUICK_BOOKMARK_PANEL:
      return {
        ...state,
        showQuickBookmarkPanel: {
          showPanel: true,
          bookmark: action.bookmark,
        },
      };
    case HIDE_QUICK_BOOKMARK_PANEL:
      return {
        ...state,
        showQuickBookmarkPanel: defaultState.showQuickBookmarkPanel,
      };
    default:
      return defaultState;
  }
};

export default reducer;
