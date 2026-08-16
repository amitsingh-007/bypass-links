import { Login02Icon, Logout02Icon } from '@hugeicons/core-free-icons';
import { useCallback, useEffect } from 'react';

import { useIsSignedIn } from '@/store/firebase/useFirebaseStore';
import useProgressStore from '@/store/progress';
import useExtStore from '@store/extension';

import { signIn, signOut } from '../utils/authentication';
import HomeActionButton from './HomeActionButton';

function Authenticate() {
  const isSignedIn = useIsSignedIn();
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);
  const isLoading = useProgressStore((state) => state.isLoading);
  const startLoading = useProgressStore((state) => state.startLoading);
  const stopLoading = useProgressStore((state) => state.stopLoading);

  const handleSignIn = async () => {
    startLoading();
    await signIn();
    stopLoading();
  };

  // Memoized: exhaustive-deps wants a stable identity for the effect below
  const handleSignOut = useCallback(async () => {
    startLoading();
    await signOut();
    stopLoading();
  }, [startLoading, stopLoading]);

  useEffect(() => {
    if (isSignedIn && !isExtensionActive) {
      handleSignOut();
    }
  }, [handleSignOut, isExtensionActive, isSignedIn]);

  return (
    <HomeActionButton
      label={isSignedIn ? 'Logout' : 'Login'}
      icon={isSignedIn ? Logout02Icon : Login02Icon}
      variant={isSignedIn ? 'destructive' : 'outline'}
      disabled={!isExtensionActive}
      isBusy={isLoading}
      testId={isSignedIn ? 'logout-button' : 'login-button'}
      requiresSignIn={false}
      onClick={isSignedIn ? handleSignOut : handleSignIn}
    />
  );
}

export default Authenticate;
