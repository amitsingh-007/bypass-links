import { create } from 'zustand';

interface State {
  monitorHistory: boolean;
  isHistoryActive: boolean;
  startHistoryMonitor: VoidFunction;
  resetHistoryMonitor: VoidFunction;
  setIsHistoryActive: (isHistoryActive: boolean) => void;
}

const useHistoryStore = create<State>()((set) => ({
  monitorHistory: false,
  isHistoryActive: false,
  startHistoryMonitor: () => set(() => ({ monitorHistory: true })),
  resetHistoryMonitor: () => set(() => ({ monitorHistory: false })),
  setIsHistoryActive: (isHistoryActive) => set(() => ({ isHistoryActive })),
}));

export default useHistoryStore;
