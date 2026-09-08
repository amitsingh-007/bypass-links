import { create } from 'zustand';

import { startHistoryWatch } from '@/utils/history';

interface State {
  isHistoryActive: boolean;
  setIsHistoryActive: (isHistoryActive: boolean) => void;
  startHistoryMonitor: () => Promise<void>;
}

const useHistoryStore = create<State>()((set) => ({
  isHistoryActive: false,

  setIsHistoryActive: (isHistoryActive) => set(() => ({ isHistoryActive })),

  async startHistoryMonitor() {
    await startHistoryWatch();
    set(() => ({ isHistoryActive: true }));
  },
}));

export default useHistoryStore;
