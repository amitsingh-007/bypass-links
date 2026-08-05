import { Button, Spinner } from '@bypass/ui';
import { Login02Icon, Logout02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useProgressStore from '@/store/progress';
import useExtStore from '@store/extension';

import { signIn, signOut } from '../utils/authentication';

function Authenticate() {
  // Derived from idpAuth, which is the persisted source of truth
  const isSignedIn = useFirebaseStore((state) => Boolean(state.idpAuth?.uid));
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);
  const { isLoading, startLoading, stopLoading } = useProgressStore();

  const handleSignIn = async () => {
    startLoading();
    await signIn();
    stopLoading();
  };

  // Kept memoized: it is a dep of the effect below, so an unstable identity
  // would re-run that effect on every render
  const handleSignOut = useCallback(async () => {
    startLoading();
    const isSignedOutSuccess = await signOut();
    if (!isSignedOutSuccess) {
      toast.error('Error while logging out');
    }
    stopLoading();
  }, [startLoading, stopLoading]);

  useEffect(() => {
    if (isSignedIn && !isExtensionActive) {
      handleSignOut();
    }
  }, [handleSignOut, isExtensionActive, isSignedIn]);

  return (
    <Button
      className="w-full font-medium"
      variant={isSignedIn ? 'destructive' : 'outline'}
      disabled={!isExtensionActive || isLoading}
      data-testid={isSignedIn ? 'logout-button' : 'login-button'}
      onClick={isSignedIn ? handleSignOut : handleSignIn}
    >
      {isLoading && <Spinner className="mr-2 size-4" />}
      {isSignedIn ? 'Logout' : 'Login'}
      <HugeiconsIcon
        icon={isSignedIn ? Logout02Icon : Login02Icon}
        strokeWidth={2}
        className="ml-2 size-4"
      />
    </Button>
  );
}

export default Authenticate;
