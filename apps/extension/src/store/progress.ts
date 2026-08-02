import { create } from 'zustand';

interface ProgressState {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  stopLoading: () => void;
  incrementProgress: (totalSteps: number) => void;
}

const useProgressStore = create<ProgressState>()((set, get) => ({
  isLoading: false,
  progress: 0,
  startLoading() {
    set(() => ({ isLoading: true, progress: 0 }));
  },
  stopLoading() {
    setTimeout(() => {
      set(() => ({ isLoading: false, progress: 0 }));
    }, 300); // 300ms delay allows users to see progress at 100% before overlay disappears
  },
  incrementProgress(totalSteps: number) {
    const { progress } = get();
    const stepSize = 100 / totalSteps;
    const newProgress = Math.min(progress + stepSize, 100);
    set(() => ({ progress: newProgress }));
  },
}));

export default useProgressStore;
