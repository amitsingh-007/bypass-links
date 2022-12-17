import create from 'zustand';
import { VoidFunction } from '@common/interfaces/custom';

interface State {
  isExtensionActive: boolean;
  turnOnExtension: VoidFunction;
  turnOffExtension: VoidFunction;
}

const useExtStore = create<State>()((set) => ({
  isExtensionActive: true,
  turnOnExtension: () => set(() => ({ isExtensionActive: true })),
  turnOffExtension: () => set(() => ({ isExtensionActive: false })),
}));

export default useExtStore;
