import { Slide, SlideProps } from "@mui/material";
import Alert, { AlertProps } from "@mui/material/Alert";
import Snackbar, { SnackbarProps } from "@mui/material/Snackbar";
import { hideToast } from "GlobalActionCreators/toast";
import { Dispatch } from "redux";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "GlobalReducers/rootReducer";

const SlideTransition = (props: SlideProps) => (
  <Slide {...props} direction="right" />
);

const Toast = () => {
  const dispatch: Dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const toast = useSelector((state: RootState) => state.toast);

  useEffect(() => {
    if (!open && toast) {
      setOpen(true);
    }
  }, [open, toast]);

  const handleClose: SnackbarProps["onClose"] = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(hideToast());
    setOpen(false);
  };

  const handleAlertClose: AlertProps["onClose"] = (event) => {
    handleClose(event, "timeout");
  };

  if (!toast?.message) {
    return null;
  }

  const { message, severity, duration } = toast;
  return (
    <Snackbar
      key={message}
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
    >
      <Alert
        sx={{ padding: "0 8px" }}
        elevation={6}
        variant="filled"
        onClose={handleAlertClose}
        severity={severity}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
