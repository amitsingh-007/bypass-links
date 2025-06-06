import { InputTOTP, noOp, STORAGE_KEYS } from '@bypass/shared';
import { getUser2FAInfo } from '@helpers/fetchFromStorage';
import { Center, Modal } from '@mantine/core';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { type IUser2FAInfo } from '../interfaces/authentication';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { trpcApi } from '@/apis/trpcApi';

function TwoFactorAuthenticate() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const [promptTOTPVerify, setPromptTOTPVerify] = useState(false);
  const [user2FAInfo, setUser2FAInfo] = useState<IUser2FAInfo>();

  useEffect(() => {
    if (isSignedIn) {
      getUser2FAInfo().then((userProfile) => {
        if (userProfile.is2FAEnabled) {
          setPromptTOTPVerify(!userProfile.isTOTPVerified);
        }
      });
    }
  }, [isSignedIn]);

  useEffect(() => {
    getUser2FAInfo().then((userProfile) => setUser2FAInfo(userProfile));
  }, [isSignedIn]);

  const onVerify = async (totp: string) => {
    if (!user2FAInfo) {
      return;
    }
    const { isVerified } = await trpcApi.twoFactorAuth.authenticate.query(totp);
    if (isVerified) {
      user2FAInfo.isTOTPVerified = true;
      await chrome.storage.local.set({
        [STORAGE_KEYS.user2FAInfo]: user2FAInfo,
      });
      setPromptTOTPVerify(false);
    } else {
      notifications.show({
        message: 'Entered TOTP is incorrect',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      fullScreen
      opened={promptTOTPVerify}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      onClose={noOp}
    >
      <Center h="100%">
        <InputTOTP handleVerify={onVerify} />
      </Center>
    </Modal>
  );
}

export default TwoFactorAuthenticate;
