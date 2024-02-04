import { trpcApi } from '@/apis/trpcApi';
import { Header, InputTOTP, STORAGE_KEYS, VoidFunction } from '@bypass/shared';
import { getUser2FAInfo } from '@helpers/fetchFromStorage';
import { Button, Center, Modal } from '@mantine/core';
import useToastStore from '@store/toast';
import { QRCodeCanvas } from 'qrcode.react';
import { memo, useEffect, useState } from 'react';
import styles from './styles/Setup2FA.module.css';

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
    const { otpAuthUrl, secretKey } =
      await trpcApi.twoFactorAuth.setup.mutate();
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
    const userProfile = await getUser2FAInfo();
    const { isVerified } = await trpcApi.twoFactorAuth.verify.query(totp);
    if (isVerified) {
      userProfile.is2FAEnabled = true;
      await chrome.storage.local.set({
        [STORAGE_KEYS.user2FAInfo]: userProfile,
      });
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
      styles={{ body: { padding: 0 } }}
    >
      <Header text="Setup two factor auth" onBackClick={handleClose} />
      <Center mt={20} className={styles.qrCodeWrapper}>
        <QRCodeCanvas value={optAuthUrl} size={200} includeMargin />
        {!showVerifyToken && (
          <Button mt="2.5rem" radius="xl" onClick={toggleTokenVerify}>
            Scan & Proceed
          </Button>
        )}
      </Center>
      {showVerifyToken && (
        <Center mt="0.625rem">
          <InputTOTP handleVerify={handleTOTPVerify} />
        </Center>
      )}
    </Modal>
  );
});

export default Setup2FA;
