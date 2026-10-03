import { create } from 'zustand';

interface ProgressState {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

let resetTimeout: ReturnType<typeof setTimeout> | undefined;

const useProgressStore = create<ProgressState>()((set) => ({
  isLoading: false,
  startLoading() {
    clearTimeout(resetTimeout);
    set(() => ({ isLoading: true }));
  },
  stopLoading() {
    clearTimeout(resetTimeout);
    // Held briefly so a fast sync does not flash the overlay in and out
    resetTimeout = setTimeout(() => {
      set(() => ({ isLoading: false }));
    }, 300);
  },
}));

export default useProgressStore;
