'use client';

import {
  googleSignIn,
  googleSignOut,
  emailAndPasswordSignIn,
} from '@app/helpers/firebase/auth';
import { useUser } from '@app/provider/AuthProvider';
import { Header, ROUTES } from '@bypass/shared';
import { TEST_CREDENTIALS_KEY } from '@app/constants';
import { Button, Center, Container, Stack } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaUserTag } from 'react-icons/fa';
import {
  RiBookmarkFill,
  RiLoginCircleFill,
  RiLogoutCircleRFill,
} from 'react-icons/ri';
import useWebPreload from './hooks/useWebPreload';
import styles from './page.module.css';

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
    <Container size="md" px={0}>
      <Header text="Bypass Links - Web" />
      <Center mt="md">
        <Stack align="stretch" className={styles.stack}>
          <Button
            fullWidth
            radius="xl"
            size="md"
            loading={isLoading}
            color={isLoggedIn ? 'teal' : 'red'}
            rightSection={
              isLoggedIn ? <RiLogoutCircleRFill /> : <RiLoginCircleFill />
            }
            onClick={isLoggedIn ? handleSignOut : handleSignIn}
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
          <Button
            radius="xl"
            size="md"
            rightSection={<RiBookmarkFill />}
            disabled={!isLoggedIn || isLoading}
            onClick={() => router.push(ROUTES.BOOKMARK_PANEL)}
          >
            Bookmarks Page
          </Button>
          <Button
            radius="xl"
            size="md"
            rightSection={<FaUserTag />}
            disabled={!isLoggedIn || isLoading}
            onClick={() => router.push(ROUTES.PERSONS_PANEL)}
          >
            Persons Page
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}
