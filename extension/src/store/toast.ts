import create from 'zustand';
import { VoidFunction } from '@bypass/common/interfaces/custom';
import { AlertColor } from '@mui/material';

interface ToastState {
  message: string | null;
  severity?: AlertColor;
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
  displayToast: ({ message, severity = 'info', duration = 3000 }) =>
    set(() => ({ toast: { message, severity, duration } })),
  hideToast: () => set(() => ({ toast: defaultState })),
}));

export default useToastStore;
