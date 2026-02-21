'use client';

import {
  googleSignIn,
  googleSignOut,
  emailAndPasswordSignIn,
} from '@app/helpers/firebase/auth';
import { useUser } from '@app/provider/AuthProvider';
import { Header, ROUTES } from '@bypass/shared';
import { Button, Spinner } from '@bypass/ui';
import { TEST_CREDENTIALS_KEY } from '@app/constants';
import {
  Bookmark01Icon,
  Login02Icon,
  Logout02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useWebPreload from './hooks/useWebPreload';

export default function Web() {
  const router = useRouter();
  const { isLoggedIn } = useUser();
  const { isLoading, preloadData, clearData } = useWebPreload();
  const [shouldPreloadData, setShouldPreloadData] = useState(false);

  /**
   * Preload data only when:
   * 1. User is logged-in: isLoggedIn
   * 2. Data has already not preloaded in local storage: shouldPreloadData
   * 3. Data is already not preloading: !isLoading
   */
  useEffect(() => {
    const preload = isLoggedIn && shouldPreloadData && !isLoading;
    if (preload) {
      preloadData().then(() => {
        setShouldPreloadData(false);
      });
    }
  }, [isLoading, preloadData, shouldPreloadData, isLoggedIn]);

  const handleSignIn = async () => {
    const testCredentialsJson = localStorage.getItem(TEST_CREDENTIALS_KEY);
    if (testCredentialsJson) {
      const testCredentials = JSON.parse(testCredentialsJson);
      await emailAndPasswordSignIn(
        testCredentials.email,
        testCredentials.password
      );
    } else {
      await googleSignIn();
    }
    setShouldPreloadData(true);
  };

  const handleSignOut = async () => {
    await googleSignOut();
    await clearData();
    setShouldPreloadData(false);
  };

  return (
    <div className="max-w-panel mx-auto px-0">
      <Header text="Bypass Links - Web" />
      <div className="mt-4 flex items-center justify-center">
        <div
          className="
            flex w-1/2 flex-col items-stretch gap-2
            max-sm:w-[80%]
          "
        >
          <Button
            className="w-full"
            variant={isLoggedIn ? 'destructive' : 'secondary'}
            disabled={isLoading}
            onClick={isLoggedIn ? handleSignOut : handleSignIn}
          >
            <span className="flex items-center justify-center gap-2">
              {isLoading && <Spinner className="mr-2 size-4" />}
              {isLoggedIn ? 'Logout' : 'Login'}
              <HugeiconsIcon
                icon={isLoggedIn ? Logout02Icon : Login02Icon}
                className="size-4"
              />
            </span>
          </Button>
          <Button
            variant="secondary"
            disabled={!isLoggedIn || isLoading}
            onClick={() => router.push(ROUTES.BOOKMARK_PANEL)}
          >
            <span className="flex items-center justify-center gap-2">
              Bookmarks Page
              <HugeiconsIcon icon={Bookmark01Icon} className="size-4" />
            </span>
          </Button>
          <Button
            variant="secondary"
            disabled={!isLoggedIn || isLoading}
            onClick={() => router.push(ROUTES.PERSONS_PANEL)}
          >
            <span className="flex items-center justify-center gap-2">
              Persons Page
              <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
