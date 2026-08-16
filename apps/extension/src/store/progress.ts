import { create } from 'zustand';

interface ProgressState {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  stopLoading: () => void;
}

const useProgressStore = create<ProgressState>()((set) => ({
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
}));

/**
 * The denominator comes from the step list itself, so adding or removing a step
 * cannot leave the bar stuck short of 100%.
 */
export const runSteps = async (steps: (() => Promise<void>)[]) => {
  // Chained rather than Promise.all: each step depends on the previous one
  await steps.reduce(async (previous, step, index) => {
    await previous;
    await step();
    useProgressStore.setState({
      progress: ((index + 1) / steps.length) * 100,
    });
  }, Promise.resolve());
};

export default useProgressStore;
