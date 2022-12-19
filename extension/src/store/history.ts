import create from 'zustand';
import { VoidFunction } from '@bypass/common/interfaces/custom';

interface State {
  monitorHistory: boolean;
  startHistoryMonitor: VoidFunction;
  resetHistoryMonitor: VoidFunction;
}

const useHistoryStore = create<State>()((set) => ({
  monitorHistory: false,
  startHistoryMonitor: () => set(() => ({ monitorHistory: true })),
  resetHistoryMonitor: () => set(() => ({ monitorHistory: false })),
}));

export default useHistoryStore;
