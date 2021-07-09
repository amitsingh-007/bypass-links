import { DISPLAY_TOAST, HIDE_TOAST } from "GlobalActionTypes/toast";
import { ToastAction, ToastState } from "SrcPath/reducers/interfaces/toast";

export const displayToast = ({
  message,
  severity = "info",
  duration = 3000,
}: ToastState): ToastAction => ({
  type: DISPLAY_TOAST,
  message,
  severity,
  duration,
});

export const hideToast = () => ({
  type: HIDE_TOAST,
});
