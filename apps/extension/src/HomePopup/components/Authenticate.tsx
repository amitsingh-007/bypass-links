import { getUserProfile } from '@helpers/fetchFromStorage';
import { Button, LoadingOverlay, Progress } from '@mantine/core';
import useAuthStore from '@store/auth';
import useExtStore from '@store/extension';
import useToastStore from '@store/toast';
import { memo, useCallback, useEffect, useState } from 'react';
import { RiLoginCircleFill, RiLogoutCircleRFill } from 'react-icons/ri';
import { signIn, signOut } from '../utils/authentication';
import styles from './styles/Authenticate.module.css';

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
    const isUserSignedIn = await signIn();
    setIsSignedIn(isUserSignedIn);
    setSignedInStatus(isUserSignedIn);
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
      const isUserSignedIn = !isSignedOut;
      setIsSignedIn(isUserSignedIn);
      setSignedInStatus(isUserSignedIn);
    }
    setIsFetching(false);
    resetAuthProgress();
  }, [displayToast, resetAuthProgress, setSignedInStatus]);

  const init = useCallback(async () => {
    const userProfile = await getUserProfile();
    const isUserSignedIn = Boolean(userProfile);
    setIsSignedIn(isUserSignedIn);
    setSignedInStatus(isUserSignedIn);
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
      {isFetching && (
        <>
          <LoadingOverlay visible zIndex={100} />
          <Progress.Root
            size="xl"
            radius="xl"
            w="100%"
            pos="fixed"
            top={0}
            left="50%"
            className={styles.progress}
          >
            <Progress.Section striped animated value={(progress * 100) / total}>
              <Progress.Label>{message || 'Loading'}</Progress.Label>
            </Progress.Section>
          </Progress.Root>
        </>
      )}
    </>
  );
});

export default Authenticate;
