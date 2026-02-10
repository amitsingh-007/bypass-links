import { create } from 'zustand';

interface ProgressState {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  stopLoading: () => void;
  setProgress: (progress: number) => void;
  incrementProgress: (totalSteps: number) => void;
  resetProgress: () => void;
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
    }, 300);
  },
  setProgress(progress: number) {
    set(() => ({ progress }));
  },
  incrementProgress(totalSteps: number) {
    const { progress } = get();
    const stepSize = 100 / totalSteps;
    const newProgress = Math.min(progress + stepSize, 100);
    set(() => ({ progress: newProgress }));
  },
  resetProgress() {
    set(() => ({ progress: 0 }));
  },
}));

export default useProgressStore;
