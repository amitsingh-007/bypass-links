import { START_HISTORY_MONITOR, RESET_HISTORY_MONITOR } from "../actionTypes";

export interface HistoryMonitorState {
  startHistoryMonitor: boolean;
}

export interface HistoryMonitorAction {
  type: string;
}
