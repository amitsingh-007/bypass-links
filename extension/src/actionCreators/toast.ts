import { AlertColor } from "@material-ui/core";
import { DISPLAY_TOAST, HIDE_TOAST } from "GlobalActionTypes/toast";

export const displayToast = ({
  message,
  severity = "info",
  duration = 3000,
}: {
  message: string;
  severity?: AlertColor;
  duration?: number;
}) => ({
  type: DISPLAY_TOAST,
  message,
  severity,
  duration,
});

export const hideToast = () => ({
  type: HIDE_TOAST,
});
