import { Button, LoadingOverlay } from '@mantine/core';
import useExtStore from '@store/extension';
import { useCallback, useEffect, useState } from 'react';
import { RiLoginCircleFill, RiLogoutCircleRFill } from 'react-icons/ri';
import { nprogress, nprogressStore } from '@mantine/nprogress';
import { notifications } from '@mantine/notifications';
import { signIn, signOut } from '../utils/authentication';
import {
  SIGN_IN_TOTAL_STEPS,
  SIGN_OUT_TOTAL_STEPS,
} from '../constants/progress';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

const initializeProgress = (totalSteps: number) => {
  nprogressStore.setState((state) => ({
    ...state,
    step: 100 / totalSteps,
  }));
  nprogress.reset();
};

const resetProgress = () => {
  nprogress.complete();
};

function Authenticate() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const setIsSignedIn = useFirebaseStore((state) => state.setIsSignedIn);
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);
  const [isFetching, setIsFetching] = useState(false);

  const handleSignIn = async () => {
    setIsFetching(true);
    initializeProgress(SIGN_IN_TOTAL_STEPS);

    const isSignInSuccess = await signIn();
    setIsSignedIn(isSignInSuccess);

    resetProgress();
    setIsFetching(false);
  };

  const handleSignOut = useCallback(async () => {
    setIsFetching(true);
    initializeProgress(SIGN_OUT_TOTAL_STEPS);

    const isSignedOutSuccess = await signOut();
    if (isSignedOutSuccess) {
      setIsSignedIn(!isSignedOutSuccess);
    } else {
      notifications.show({
        message: 'Error while logging out',
        color: 'red',
      });
    }

    setIsFetching(false);
    resetProgress();
  }, [setIsSignedIn]);

  // Init
  useEffect(() => {
    const { idpAuth } = useFirebaseStore.getState();
    setIsSignedIn(Boolean(idpAuth?.uid));
  }, [setIsSignedIn]);

  useEffect(() => {
    if (isSignedIn && !isExtensionActive) {
      handleSignOut();
    }
  }, [handleSignOut, isExtensionActive, isSignedIn]);

  return (
    <>
      <Button
        radius="xl"
        loading={isFetching}
        disabled={!isExtensionActive}
        onClick={isSignedIn ? handleSignOut : handleSignIn}
        color={isSignedIn ? 'teal' : 'red'}
        rightSection={
          isSignedIn ? <RiLogoutCircleRFill /> : <RiLoginCircleFill />
        }
        fullWidth
      >
        {isSignedIn ? 'Logout' : 'Login'}
      </Button>
      {isFetching && <LoadingOverlay w="100%" visible zIndex={100} />}
    </>
  );
}

export default Authenticate;
