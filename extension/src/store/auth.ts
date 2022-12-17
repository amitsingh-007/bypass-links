import create from 'zustand';
import { AuthenticationEvent } from 'GlobalInterfaces/authentication';
import { VoidFunction } from '@common/interfaces/custom';

interface State {
  authProgress: AuthenticationEvent | null;
  setAuthProgress: (data: AuthenticationEvent) => void;
  resetAuthProgress: VoidFunction;
}

const useAuthStore = create<State>()((set) => ({
  authProgress: null,
  setAuthProgress: (data) => set(() => ({ authProgress: data })),
  resetAuthProgress: () => set(() => ({ authProgress: null })),
}));

export default useAuthStore;
