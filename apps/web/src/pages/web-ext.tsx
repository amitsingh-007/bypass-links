import styles from '@/styles/web-ext.module.css';
import { ITwoFactorAuth } from '@/ui/TwoFactorAuth/interface';
import { googleSignIn, googleSignOut } from '@/ui/firebase/auth';
import useWebPreload from '@/ui/hooks/useWebPreload';
import { useUser } from '@/ui/provider/AuthProvider';
import { getFromLocalStorage, setToLocalStorage } from '@/ui/provider/utils';
import { api } from '@/utils/api';
import { Header, InputTOTP, ROUTES, STORAGE_KEYS } from '@bypass/shared';
import { Button, Center, Container, Stack } from '@mantine/core';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaUserTag } from 'react-icons/fa';
import {
  RiBookMarkFill,
  RiLoginCircleFill,
  RiLogoutCircleRFill,
} from 'react-icons/ri';

export const config = {
  runtime: 'experimental-edge',
};

export default function Web() {
  const router = useRouter();
  const { user, isLoggedIn } = useUser();
  const { isLoading, preloadData, clearData } = useWebPreload();
  const [shouldPreloadData, setShouldPreloadData] = useState(false);
  const [promptTOTPVerify, setPromptTOTPVerify] = useState(false);

  const initTOTPPrompt = async () => {
    const twoFAData = await getFromLocalStorage<ITwoFactorAuth>(
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
    const { isVerified } = await api.twoFactorAuth.authenticate.query({
      uid: user?.uid ?? '',
      totp,
    });
    if (isVerified) {
      const twoFAData = await getFromLocalStorage<ITwoFactorAuth>(
        STORAGE_KEYS.twoFactorAuth
      );
      if (!twoFAData) {
        return;
      }
      twoFAData.isTOTPVerified = true;
      await setToLocalStorage(STORAGE_KEYS.twoFactorAuth, twoFAData);
      setPromptTOTPVerify(false);
    } else {
      alert('Entered TOTP is incorrect');
    }
  };

  return (
    <Container size="md" px={0}>
      <NextSeo title="Home" noindex nofollow />
      <Header text="Bypass Links - Web" />
      <Center mt="md">
        <Stack
          align={promptTOTPVerify ? 'center' : 'stretch'}
          className={styles.stack}
        >
          <Button
            radius="xl"
            size="md"
            loading={isLoading}
            onClick={isLoggedIn ? handleSignOut : handleSignIn}
            color={isLoggedIn ? 'teal' : 'red'}
            rightSection={
              isLoggedIn ? <RiLogoutCircleRFill /> : <RiLoginCircleFill />
            }
            fullWidth
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
                rightSection={<RiBookMarkFill />}
                onClick={() => router.push(ROUTES.BOOKMARK_PANEL)}
                disabled={!isLoggedIn || isLoading}
              >
                Bookmarks Page
              </Button>
              <Button
                radius="xl"
                size="md"
                rightSection={<FaUserTag />}
                onClick={() => router.push(ROUTES.PERSONS_PANEL)}
                disabled={!isLoggedIn || isLoading}
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
