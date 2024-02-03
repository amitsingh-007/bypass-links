import { trpcApi } from '@/apis/trpcApi';
import { InputTOTP, STORAGE_KEYS } from '@bypass/shared';
import { getUserProfile } from '@helpers/fetchFromStorage';
import { Center, Modal } from '@mantine/core';
import useAuthStore from '@store/auth';
import useToastStore from '@store/toast';
import { useEffect, useState } from 'react';
import { UserInfo } from '../interfaces/authentication';

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

  const onVerify = async (totp: string) => {
    if (!user) {
      return;
    }
    const { isVerified } = await trpcApi.twoFactorAuth.authenticate.query(totp);
    if (isVerified) {
      user.isTOTPVerified = true;
      await chrome.storage.local.set({ [STORAGE_KEYS.userProfile]: user });
      setPromptTOTPVerify(false);
    } else {
      displayToast({
        message: 'Entered TOTP is incorrect',
        severity: 'error',
      });
    }
  };

  return (
    <Modal
      opened={promptTOTPVerify}
      fullScreen
      onClose={() => undefined}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Center h="100%">
        <InputTOTP handleVerify={onVerify} />
      </Center>
    </Modal>
  );
};

export default TwoFactorAuthenticate;
