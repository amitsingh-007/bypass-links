import { AlertColor } from "@material-ui/core";

export interface ToastState {
  message: string | null;
  severity?: AlertColor;
  duration?: number;
}

export interface ToastAction extends ToastState {
  type: string;
}
