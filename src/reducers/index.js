import {
  HIDE_BOOKMARKS_PANEL,
  HIDE_MANUAL_HISTORY_PANEL,
  HIDE_QUICK_BOOKMARK_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_BOOKMARKS_PANEL,
  SHOW_MANUAL_HISTORY_PANEL,
  SHOW_QUICK_BOOKMARK_PANEL,
  START_HISTORY_MONITOR,
  TURN_OFF_EXTENSION,
  TURN_ON_EXTENSION,
} from "GlobalActionTypes/index";

const defaultState = {
  isSignedIn: false,
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
