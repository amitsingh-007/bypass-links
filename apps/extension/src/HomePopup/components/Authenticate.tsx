import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { Button, LoadingOverlay, Progress } from '@mantine/core';
import useAuthStore from '@/store/authProgress';
import useExtStore from '@store/extension';
import useToastStore from '@store/toast';
import { memo, useCallback, useEffect, useState } from 'react';
import { RiLoginCircleFill, RiLogoutCircleRFill } from 'react-icons/ri';
import { signIn, signOut } from '../utils/authentication';
import styles from './styles/Authenticate.module.css';

const Authenticate = memo(function Authenticate() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const setIsSignedIn = useFirebaseStore((state) => state.setIsSignedIn);
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);
  const displayToast = useToastStore((state) => state.displayToast);
  const authProgress = useAuthStore((state) => state.authProgress);
  const resetAuthProgress = useAuthStore((state) => state.resetAuthProgress);
  const [isFetching, setIsFetching] = useState(false);

  const handleSignIn = async () => {
    setIsFetching(true);
    const isSignInSuccess = await signIn();
    setIsSignedIn(isSignInSuccess);
    resetAuthProgress();
    setIsFetching(false);
  };

  const handleSignOut = useCallback(async () => {
    setIsFetching(true);
    const isSignedOutSuccess = await signOut();
    if (!isSignedOutSuccess) {
      displayToast({
        message: 'Error while logging out',
        severity: 'error',
      });
    } else {
      setIsSignedIn(!isSignedOutSuccess);
    }
    setIsFetching(false);
    resetAuthProgress();
  }, [displayToast, resetAuthProgress, setIsSignedIn]);

  // Init
  useEffect(() => {
    const { idpAuth } = useFirebaseStore.getState();
    setIsSignedIn(!!idpAuth?.uid);
  }, [setIsSignedIn]);

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
