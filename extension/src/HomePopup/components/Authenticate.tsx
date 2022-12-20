import { Dialog, LinearProgress, SvgIcon, Typography } from '@mui/material';
import { getUserProfile } from '@helpers/fetchFromStorage';
import useAuthStore from '@store/auth';
import useExtStore from '@store/extension';
import useToastStore from '@store/toast';
import { memo, useCallback, useEffect, useState } from 'react';
import { RiLoginCircleFill, RiLogoutCircleRFill } from 'react-icons/ri';
import { signIn, signOut } from '../utils/authentication';
import StyledButton from './StyledButton';

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
    const isSignedIn = await signIn();
    setIsSignedIn(isSignedIn);
    setSignedInStatus(isSignedIn);
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
      const isSignedIn = !isSignedOut;
      setIsSignedIn(isSignedIn);
      setSignedInStatus(isSignedIn);
    }
    setIsFetching(false);
    resetAuthProgress();
  }, [displayToast, resetAuthProgress, setSignedInStatus]);

  const init = useCallback(async () => {
    const userProfile = await getUserProfile();
    const isSignedIn = Boolean(userProfile);
    setIsSignedIn(isSignedIn);
    setSignedInStatus(isSignedIn);
  }, [setSignedInStatus]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isSignedIn && !isExtensionActive) {
      handleSignOut();
    }
  }, [handleSignOut, isExtensionActive, isSignedIn]);

  const {
    message,
    progress = 0,
    progressBuffer = 0,
    total = 1,
  } = authProgress || {};
  return (
    <>
      <StyledButton
        showSuccessColor={isSignedIn}
        isLoading={isFetching}
        isDisabled={!isExtensionActive}
        onClick={isSignedIn ? handleSignOut : handleSignIn}
        color="success"
      >
        <SvgIcon>
          {isSignedIn ? <RiLogoutCircleRFill /> : <RiLoginCircleFill />}
        </SvgIcon>
      </StyledButton>
      {isFetching && (
        <Dialog
          sx={{
            '.MuiPaper-root': {
              m: 0,
              top: 0,
              width: '100%',
              position: 'fixed',
              borderRadius: '0px',
              backgroundColor: 'unset',
              backgroundImage: 'unset',
            },
          }}
          open
        >
          <LinearProgress
            variant="buffer"
            value={(progress * 100) / total}
            valueBuffer={(progressBuffer * 100) / total}
            color="secondary"
          />
          <Typography
            sx={{
              display: 'flex',
              justifyContent: 'center',
              fontSize: '9px',
              fontStyle: 'italic',
            }}
          >
            {message || 'Loading'}
          </Typography>
        </Dialog>
      )}
    </>
  );
});

export default Authenticate;
