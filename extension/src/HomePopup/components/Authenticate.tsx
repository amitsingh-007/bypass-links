import { getUserProfile } from '@helpers/fetchFromStorage';
import { Button, LoadingOverlay, Progress } from '@mantine/core';
import useAuthStore from '@store/auth';
import useExtStore from '@store/extension';
import useToastStore from '@store/toast';
import { memo, useCallback, useEffect, useState } from 'react';
import { RiLoginCircleFill, RiLogoutCircleRFill } from 'react-icons/ri';
import { signIn, signOut } from '../utils/authentication';

const Authenticate = memo(function Authenticate() {
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);
  const displayToast = useToastStore((state) => state.displayToast);
  const authProgress = useAuthStore((state) => state.authProgress);
  const setSignedInStatus = useAuthStore((state) => state.setSignedInStatus);
  const resetAuthProgress = useAuthStore((state) => state.resetAuthProgress);
  const [isFetching, setIsFetching] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = async () => {
    setIsFetching(true);
    const isSignedIn = await signIn();
    setIsSignedIn(isSignedIn);
    setSignedInStatus(isSignedIn);
    resetAuthProgress();
    setIsFetching(false);
  };

  const handleSignOut = useCallback(async () => {
    setIsFetching(true);
    const isSignedOut = await signOut();
    if (!isSignedOut) {
      displayToast({
        message: 'Error while logging out',
        severity: 'error',
      });
    } else {
      const isSignedIn = !isSignedOut;
      setIsSignedIn(isSignedIn);
      setSignedInStatus(isSignedIn);
    }
    setIsFetching(false);
    resetAuthProgress();
  }, [displayToast, resetAuthProgress, setSignedInStatus]);

  const init = useCallback(async () => {
    const userProfile = await getUserProfile();
    const isSignedIn = Boolean(userProfile);
    setIsSignedIn(isSignedIn);
    setSignedInStatus(isSignedIn);
  }, [setSignedInStatus]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isSignedIn && !isExtensionActive) {
      handleSignOut();
    }
  }, [handleSignOut, isExtensionActive, isSignedIn]);

  const { message, progress = 7, total = 1 } = authProgress || {};
  return (
    <>
      <Button
        variant="light"
        radius="xl"
        loading={isFetching}
        loaderPosition="right"
        disabled={!isExtensionActive}
        onClick={isSignedIn ? handleSignOut : handleSignIn}
        color={isSignedIn ? 'red' : 'teal'}
        rightIcon={isSignedIn ? <RiLogoutCircleRFill /> : <RiLoginCircleFill />}
        fullWidth
      >
        {isSignedIn ? 'Logout' : 'Login'}
      </Button>
      {isFetching && (
        <>
          <LoadingOverlay visible zIndex={100} />
          <Progress
            value={(progress * 100) / total}
            label={message || 'Loading'}
            size="xl"
            radius="xl"
            sx={{
              zIndex: 105,
              width: '100%',
              position: 'fixed',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </>
      )}
    </>
  );
});

export default Authenticate;
