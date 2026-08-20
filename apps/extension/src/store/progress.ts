import { create } from 'zustand';

interface ProgressState {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const useProgressStore = create<ProgressState>()((set) => ({
  isLoading: false,
  startLoading() {
    set(() => ({ isLoading: true }));
  },
  stopLoading() {
    // Held briefly so a fast sync does not flash the overlay in and out
    setTimeout(() => {
      set(() => ({ isLoading: false }));
    }, 300);
  },
}));

export default useProgressStore;
