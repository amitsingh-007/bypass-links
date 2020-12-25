import {
  HIDE_QUICK_BOOKMARK_PANEL,
  SET_SIGNED_IN_STATUS,
  SHOW_QUICK_BOOKMARK_PANEL,
  START_HISTORY_MONITOR,
  TURN_OFF_EXTENSION,
  TURN_ON_EXTENSION,
} from "GlobalActionTypes/index";

const defaultState = {
  isSignedIn: false,
  isExtensionActive: true,
  startHistoryMonitor: false,
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
