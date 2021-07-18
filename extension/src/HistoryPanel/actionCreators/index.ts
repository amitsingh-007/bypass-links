import { RESET_HISTORY_MONITOR, START_HISTORY_MONITOR } from "../actionTypes";

export const startHistoryMonitor = () => ({
  type: START_HISTORY_MONITOR,
});

export const resetHistoryMonitor = () => ({
  type: RESET_HISTORY_MONITOR,
});
