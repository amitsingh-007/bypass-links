import { Alert, AlertProps, Transition } from '@mantine/core';
import useToastStore, { ToastType } from '@store/toast';
import { useEffect, useRef, useState } from 'react';

const COLOR_MAP: Record<ToastType, AlertProps['color']> = {
  success: 'teal',
  error: 'red',
};

const Toast = () => {
  const toast = useToastStore((state) => state.toast);
  const hideToast = useToastStore((state) => state.hideToast);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>(undefined);

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
          variant="light"
          withCloseButton
          onClose={hideToast}
          color={COLOR_MAP[severity]}
          w="fit-content"
          maw="15.625rem"
          p="0.5rem"
          bottom="0.625rem"
          left="0.625rem"
          pos="fixed"
          style={styles}
          styles={{
            wrapper: {
              alignItems: 'center',
              gap: '0.5rem',
            },
          }}
        >
          {message}
        </Alert>
      )}
    </Transition>
  );
};

export default Toast;
