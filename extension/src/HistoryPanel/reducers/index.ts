import { RESET_HISTORY_MONITOR, START_HISTORY_MONITOR } from '../actionTypes';
import {
  HistoryMonitorAction,
  HistoryMonitorState,
} from '../interfaces/reducer';

const defaultState = {
  startHistoryMonitor: false,
};

const historyMonitorReducer = (
  state: HistoryMonitorState = defaultState,
  action: HistoryMonitorAction
): HistoryMonitorState => {
  switch (action.type) {
    case START_HISTORY_MONITOR:
      return {
        ...state,
        startHistoryMonitor: true,
      };
    case RESET_HISTORY_MONITOR:
      return {
        ...state,
        startHistoryMonitor: false,
      };
    default:
      return defaultState;
  }
};

export default historyMonitorReducer;
