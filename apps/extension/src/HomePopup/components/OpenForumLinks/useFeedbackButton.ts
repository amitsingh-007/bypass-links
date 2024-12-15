import { useEffect, useRef, useState } from 'react';

export enum EButtonState {
  INITIAL,
  LOADING,
  SUCCESS,
}

const SUCCESS_TIMEOUT_MS = 3000;

const useFeedbackButton = (handler: () => Promise<void>) => {
  const [buttonState, setButtonState] = useState(EButtonState.INITIAL);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (buttonState === EButtonState.SUCCESS) {
      timeoutRef.current = setTimeout(
        () => setButtonState(EButtonState.INITIAL),
        SUCCESS_TIMEOUT_MS
      );
    }
  }, [buttonState]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const onClick = async () => {
    clearTimeout(timeoutRef.current);
    setButtonState(EButtonState.LOADING);

    await handler();

    setButtonState(EButtonState.SUCCESS);
  };

  return {
    buttonState,
    onClick,
  };
};

export default useFeedbackButton;
