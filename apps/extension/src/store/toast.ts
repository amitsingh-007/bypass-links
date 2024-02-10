import { create } from 'zustand';

export type ToastType = 'success' | 'error';

interface ToastState {
  message: string | null;
  severity?: ToastType;
  duration?: number;
}

interface State {
  toast: ToastState;
  displayToast: (data: ToastState) => void;
  hideToast: VoidFunction;
}

const defaultState: ToastState = {
  message: null,
};

const useToastStore = create<State>()((set) => ({
  toast: defaultState,
  displayToast: (toast) => set(() => ({ toast })),
  hideToast: () => set(() => ({ toast: defaultState })),
}));

export default useToastStore;
