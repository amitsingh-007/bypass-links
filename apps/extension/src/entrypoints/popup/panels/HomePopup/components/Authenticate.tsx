import { Button, Spinner } from '@bypass/ui';
import useExtStore from '@store/extension';
import { useCallback, useEffect, useState } from 'react';
import { RiLoginCircleFill, RiLogoutCircleRFill } from 'react-icons/ri';
import { toast } from 'sonner';
import { signIn, signOut } from '../utils/authentication';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useProgressStore from '@/store/progress';

function Authenticate() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const setIsSignedIn = useFirebaseStore((state) => state.setIsSignedIn);
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);
  const { isLoading, startLoading, stopLoading } = useProgressStore();
  const [isFetching, setIsFetching] = useState(false);

  const handleSignIn = async () => {
    setIsFetching(true);
    startLoading();

    const isSignInSuccess = await signIn();
    setIsSignedIn(isSignInSuccess);

    stopLoading();
    setIsFetching(false);
  };

  const handleSignOut = useCallback(async () => {
    setIsFetching(true);
    startLoading();

    const isSignedOutSuccess = await signOut();
    if (isSignedOutSuccess) {
      setIsSignedIn(!isSignedOutSuccess);
    } else {
      toast.error('Error while logging out');
    }

    stopLoading();
    setIsFetching(false);
  }, [setIsSignedIn, startLoading, stopLoading]);

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
    <Button
      className="w-full"
      variant={isSignedIn ? 'default' : 'outline'}
      disabled={!isExtensionActive || isFetching || isLoading}
      data-testid={isSignedIn ? 'logout-button' : 'login-button'}
      onClick={isSignedIn ? handleSignOut : handleSignIn}
    >
      {(isFetching || isLoading) && (
        <Spinner className="mr-2 size-4 animate-spin" />
      )}
      {isSignedIn ? 'Logout' : 'Login'}
      {isSignedIn ? (
        <RiLogoutCircleRFill className="ml-2 size-4" />
      ) : (
        <RiLoginCircleFill className="ml-2 size-4" />
      )}
    </Button>
  );
}

export default Authenticate;
