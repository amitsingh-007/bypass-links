import { Alert, AlertProps, Transition } from '@mantine/core';
import useToastStore, { ToastType } from '@store/toast';
import { memo, useEffect, useRef, useState } from 'react';

const COLOR_MAP: Record<ToastType, AlertProps['color']> = {
  success: 'teal',
  error: 'red',
};

const Toast = memo(function Toast() {
  const toast = useToastStore((state) => state.toast);
  const hideToast = useToastStore((state) => state.hideToast);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    const { message, duration = 3000 } = toast;
    if (message) {
      if (!open) {
        setOpen(true);
      }
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(hideToast, duration);
    } else {
      setOpen(false);
    }
  }, [hideToast, open, toast]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const { message, severity = 'success' } = toast;
  return (
    <Transition
      mounted={open}
      transition="slide-right"
      timingFunction="ease"
      duration={400}
      exitDuration={0}
    >
      {(styles) => (
        <Alert
          radius="md"
          variant="outline"
          withCloseButton
          onClose={hideToast}
          color={COLOR_MAP[severity]}
          w="fit-content"
          maw="250px"
          p={8}
          pr={35}
          bottom={10}
          left={10}
          pos="fixed"
          style={styles}
        >
          {message}
        </Alert>
      )}
    </Transition>
  );
});

export default Toast;
