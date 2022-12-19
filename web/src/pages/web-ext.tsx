import { googleSignIn, googleSignOut } from '@/ui/firebase/auth';
import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ROUTES } from '@bypass/common/constants/routes';
import useWebPreload from '@/ui/hooks/useWebPreload';
import { useEffect, useState } from 'react';
import { useUser } from '@/ui/provider/AuthProvider';
import MetaTags from '@/ui/components/MetaTags';
import { RiLoginCircleFill, RiLogoutCircleRFill } from 'react-icons/ri';
import { RiBookMarkFill } from 'react-icons/ri';
import { FaUserTag } from 'react-icons/fa';
import { LoadingButton } from '@mui/lab';
import { getFromLocalStorage, setToLocalStorage } from '@/ui/provider/utils';
import { STORAGE_KEYS } from '@bypass/common/constants/storage';
import { ITwoFactorAuth } from '@/ui/TwoFactorAuth/interface';
import TOTPPopup from '@bypass/common/components/Auth/components/TOTPPopup';

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
      return setPromptTOTPVerify(false);
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

  const onVerify = async (isVerified: boolean) => {
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
    <Container maxWidth="md" sx={{ pt: '16px' }}>
      <MetaTags titleSuffix="Home" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          userSelect: 'none',
        }}
      >
        <Typography variant="h3">Bypass Links</Typography>
        <Typography variant="h4">Web Version</Typography>
        <LoadingButton
          variant="outlined"
          startIcon={
            isLoggedIn ? <RiLoginCircleFill /> : <RiLogoutCircleRFill />
          }
          onClick={isLoggedIn ? handleSignOut : handleSignIn}
          loading={isLoading}
          color={isLoggedIn ? 'success' : 'error'}
        >
          {isLoggedIn ? 'Logout' : 'Login'}
        </LoadingButton>
        {promptTOTPVerify ? (
          <TOTPPopup
            userId={user?.uid ?? ''}
            promptTOTPVerify={promptTOTPVerify}
            verifyCallback={onVerify}
          />
        ) : (
          <>
            <Button
              variant="outlined"
              startIcon={<RiBookMarkFill />}
              onClick={() => router.push(ROUTES.BOOKMARK_PANEL)}
              disabled={!isLoggedIn || isLoading}
              color="secondary"
            >
              Bookmarks Page
            </Button>
            <Button
              variant="outlined"
              startIcon={<FaUserTag />}
              onClick={() => router.push(ROUTES.PERSONS_PANEL)}
              disabled={!isLoggedIn || isLoading}
              color="secondary"
            >
              Persons Page
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
