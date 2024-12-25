import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface State {
  lastChecked: number | undefined;
  setLastChecked: (val: number) => void;
}

const useOutdatedExtensionStore = create<State>()(
  persist(
    (set) => ({
      lastChecked: undefined,
      setLastChecked: (val: number) => set(() => ({ lastChecked: val })),
    }),
    {
      name: '__outdatedCheck',
    }
  )
);

export default useOutdatedExtensionStore;
