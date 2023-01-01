import InputTOTP from '@bypass/shared/components/Auth/components/InputTOTP';
import Header from '@bypass/shared/components/Header';
import { STORAGE_KEYS } from '@bypass/shared/constants/storage';
import { VoidFunction } from '@bypass/shared/interfaces/custom';
import storage from '@helpers/chrome/storage';
import { getUserProfile } from '@helpers/fetchFromStorage';
import { Button, Center, Modal } from '@mantine/core';
import useToastStore from '@store/toast';
import { QRCodeCanvas } from 'qrcode.react';
import { memo, useEffect, useState } from 'react';
import { setup2FA, verify2FA } from '../apis/twoFactorAuth';

type Props = {
  isOpen: boolean;
  handleClose: VoidFunction;
};

const Setup2FA = memo(function Setup2FA({ isOpen, handleClose }: Props) {
  const displayToast = useToastStore((state) => state.displayToast);
  const [, setSecretKey] = useState('');
  const [optAuthUrl, setOptAuthUrl] = useState('');
  const [showVerifyToken, setShowVerifyToken] = useState(false);

  const init2FA = async () => {
    const userProfile = await getUserProfile();
    const { otpAuthUrl, secretKey } = await setup2FA(userProfile.uid ?? '');
    setSecretKey(secretKey);
    setOptAuthUrl(otpAuthUrl);
  };

  useEffect(() => {
    init2FA();
  }, []);

  const toggleTokenVerify = () => {
    setShowVerifyToken(!showVerifyToken);
  };

  const handleTOTPVerify = async (totp: string) => {
    const userProfile = await getUserProfile();
    const { isVerified } = await verify2FA(userProfile.uid ?? '', totp);
    if (isVerified) {
      userProfile.is2FAEnabled = true;
      await storage.set({ [STORAGE_KEYS.userProfile]: userProfile });
      handleClose();
    } else {
      displayToast({
        message: 'Entered TOTP is incorrect',
        severity: 'error',
      });
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      fullScreen
      zIndex={1002}
      withCloseButton={false}
      styles={{ modal: { padding: '0 !important' } }}
    >
      <Header text="Setup two factor auth" onBackClick={handleClose} />
      <Center mt={20} sx={{ flexDirection: 'column' }}>
        <QRCodeCanvas value={optAuthUrl} size={200} includeMargin />
        {!showVerifyToken && (
          <Button mt={40} radius="xl" onClick={toggleTokenVerify}>
            Scan & Proceed
          </Button>
        )}
      </Center>
      {showVerifyToken && (
        <Center mt={10}>
          <InputTOTP handleVerify={handleTOTPVerify} />
        </Center>
      )}
    </Modal>
  );
});

export default Setup2FA;
