import { noOp } from '@bypass/shared';
import { useEffect, useState } from 'react';

export enum EButtonState {
  INITIAL,
  LOADING,
  SUCCESS,
}

const SUCCESS_TIMEOUT_MS = 3000;

const useFeedbackButton = (handler: () => Promise<void>) => {
  const [buttonState, setButtonState] = useState(EButtonState.INITIAL);

  // The cleanup covers both cancelling on a re-click, which moves state to
  // LOADING, and unmounting, so no ref or manual clearTimeout is needed
  useEffect(() => {
    if (buttonState !== EButtonState.SUCCESS) {
      return noOp;
    }
    const timeout = setTimeout(
      () => setButtonState(EButtonState.INITIAL),
      SUCCESS_TIMEOUT_MS
    );
    return () => clearTimeout(timeout);
  }, [buttonState]);

  const onClick = async () => {
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
