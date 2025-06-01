'use client';

import { googleSignIn, googleSignOut } from '@app/helpers/firebase/auth';
import { useUser } from '@app/provider/AuthProvider';
import { type ITwoFactorAuth } from '@app/types';
import { api } from '@app/utils/api';
import { getFromLocalStorage, setToLocalStorage } from '@app/utils/storage';
import { Header, InputTOTP, ROUTES, STORAGE_KEYS } from '@bypass/shared';
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
  const [promptTOTPVerify, setPromptTOTPVerify] = useState(false);

  const initTOTPPrompt = () => {
    const twoFAData = getFromLocalStorage<ITwoFactorAuth>(
      STORAGE_KEYS.twoFactorAuth
    );
    if (!twoFAData) {
      setPromptTOTPVerify(false);
      return;
    }
    if (twoFAData.is2FAEnabled) {
      setPromptTOTPVerify(!twoFAData.isTOTPVerified);
    }
  };

  useEffect(() => {
    initTOTPPrompt();
  }, [isLoggedIn]);

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
        initTOTPPrompt();
      });
    }
  }, [isLoading, preloadData, shouldPreloadData, isLoggedIn]);

  const handleSignIn = async () => {
    await googleSignIn();
    setShouldPreloadData(true);
  };

  const handleSignOut = async () => {
    await googleSignOut();
    await clearData();
    setShouldPreloadData(false);
  };

  const onVerify = async (totp: string) => {
    const { isVerified } = await api.twoFactorAuth.authenticate.query(totp);
    if (isVerified) {
      const twoFAData = getFromLocalStorage<ITwoFactorAuth>(
        STORAGE_KEYS.twoFactorAuth
      );
      if (!twoFAData) {
        return;
      }
      twoFAData.isTOTPVerified = true;
      setToLocalStorage(STORAGE_KEYS.twoFactorAuth, twoFAData);
      setPromptTOTPVerify(false);
    } else {
      alert('Entered TOTP is incorrect');
    }
  };

  return (
    <Container size="md" px={0}>
      <Header text="Bypass Links - Web" />
      <Center mt="md">
        <Stack
          align={promptTOTPVerify ? 'center' : 'stretch'}
          className={styles.stack}
        >
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
          {promptTOTPVerify ? (
            <InputTOTP handleVerify={onVerify} />
          ) : (
            <>
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
            </>
          )}
        </Stack>
      </Center>
    </Container>
  );
}
