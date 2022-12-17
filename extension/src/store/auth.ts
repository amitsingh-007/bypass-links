import create from 'zustand';
import { AuthenticationEvent } from 'GlobalInterfaces/authentication';
import { VoidFunction } from '@common/interfaces/custom';

interface State {
  isSignedIn: boolean;
  authProgress: AuthenticationEvent | null;
  setSignedInStatus: (isSignedIn: boolean) => void;
  setAuthProgress: (data: AuthenticationEvent) => void;
  resetAuthProgress: VoidFunction;
}

const useAuthStore = create<State>()((set) => ({
  isSignedIn: false,
  authProgress: null,
  setSignedInStatus: (isSignedIn) => set(() => ({ isSignedIn })),
  setAuthProgress: (data) => set(() => ({ authProgress: data })),
  resetAuthProgress: () => set(() => ({ authProgress: null })),
}));

export default useAuthStore;
