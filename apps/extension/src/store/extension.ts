import { create } from 'zustand';

interface State {
  isExtensionActive: boolean;
  setIsExtensionActive: (isExtensionActive: boolean) => void;
}

const useExtStore = create<State>()((set) => ({
  // Defaults to true: Authenticate reads this on mount and would auto-sign-out
  // if it started false while storage is still resolving
  isExtensionActive: true,
  setIsExtensionActive: (isExtensionActive: boolean) =>
    set(() => ({ isExtensionActive })),
}));

export default useExtStore;
