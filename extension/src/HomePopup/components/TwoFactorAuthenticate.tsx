import { STORAGE_KEYS } from '@bypass/common/constants/storage';
import storage from 'GlobalHelpers/chrome/storage';
import { getUserProfile } from 'GlobalHelpers/fetchFromStorage';
import { useEffect, useState } from 'react';
import TOTPPopup from '@bypass/common/components/Auth/components/TOTPPopup';
import { UserInfo } from '../interfaces/authentication';
import useToastStore from 'GlobalStore/toast';
import useAuthStore from 'GlobalStore/auth';

const TwoFactorAuthenticate = () => {
  const displayToast = useToastStore((state) => state.displayToast);
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const [promptTOTPVerify, setPromptTOTPVerify] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const initTOTPPrompt = async () => {
    const userProfile = await getUserProfile();
    if (userProfile.is2FAEnabled) {
      setPromptTOTPVerify(!userProfile.isTOTPVerified);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      initTOTPPrompt();
    }
  }, [isSignedIn]);

  useEffect(() => {
    getUserProfile().then((userProfile) => setUser(userProfile));
  }, [isSignedIn]);

  const onVerify = async (isVerified: boolean) => {
    if (!user) {
      return;
    }
    if (isVerified) {
      user.isTOTPVerified = true;
      await storage.set({ [STORAGE_KEYS.userProfile]: user });
      setPromptTOTPVerify(false);
    } else {
      displayToast({
        message: 'Entered TOTP is incorrect',
        severity: 'error',
      });
    }
  };

  return (
    <TOTPPopup
      dialog
      userId={user?.uid ?? ''}
      promptTOTPVerify={promptTOTPVerify}
      verifyCallback={onVerify}
    />
  );
};

export default TwoFactorAuthenticate;
