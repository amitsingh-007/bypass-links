import { create } from 'zustand';

interface State {
  isExtensionActive: boolean;
  setIsExtensionActive: (isExtensionActive: boolean) => void;
}

const useExtStore = create<State>()((set) => ({
  // Must default true: Authenticate would auto-sign-out while storage resolves
  isExtensionActive: true,
  setIsExtensionActive: (isExtensionActive: boolean) =>
    set(() => ({ isExtensionActive })),
}));

export default useExtStore;
