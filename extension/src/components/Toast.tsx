import { Slide, SlideProps } from '@mui/material';
import Alert, { AlertProps } from '@mui/material/Alert';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import useToastStore from '@store/toast';

const SlideTransition = (props: SlideProps) => (
  <Slide {...props} direction="right" />
);

const Toast = () => {
  const toast = useToastStore((state) => state.toast);
  const hideToast = useToastStore((state) => state.hideToast);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open && toast) {
      setOpen(true);
    }
  }, [open, toast]);

  const handleClose: SnackbarProps['onClose'] = (_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideToast();
    setOpen(false);
  };

  const handleAlertClose: AlertProps['onClose'] = (event) => {
    handleClose(event, 'timeout');
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
        sx={{ padding: '0 8px' }}
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
