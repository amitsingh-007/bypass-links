import { makeStyles, Slide } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/core/Alert";
import { hideToast } from "GlobalActionCreators/";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const position = {
  vertical: "top",
  horizontal: "right",
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "8px",
  },
}));

const SlideTransition = (props) => <Slide {...props} direction="left" />;

const Toast = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const toast = useSelector((state) => state.toast);

  useEffect(() => {
    if (!open && toast) {
      setOpen(true);
    }
  }, [toast]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(hideToast());
    setOpen(false);
  };

  if (!toast) {
    return null;
  }

  const { message, severity = "info", duration = 3000 } = toast;
  return (
    <Snackbar
      key={message}
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
    >
      <Alert
        className={classes.root}
        elevation={6}
        variant="filled"
        onClose={handleClose}
        severity={severity}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
