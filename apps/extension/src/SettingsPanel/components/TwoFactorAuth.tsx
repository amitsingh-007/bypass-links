import { STORAGE_KEYS } from '@bypass/shared';
import { getUser2FAInfo } from '@helpers/fetchFromStorage';
import { Button, Flex, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import Setup2FA from './Setup2FA';
import { trpcApi } from '@/apis/trpcApi';

function TwoFactorAuth() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  const initSetup2FA = async () => {
    const userProfile = await getUser2FAInfo();
    setIs2FAEnabled(Boolean(userProfile.is2FAEnabled));
  };

  useEffect(() => {
    initSetup2FA();
  }, [show2FASetup]);

  const handle2FARevoke = async () => {
    const userProfile = await getUser2FAInfo();
    const { isRevoked } = await trpcApi.twoFactorAuth.revoke.mutate();
    if (!isRevoked) {
      notifications.show({ message: 'Something went wrong', color: 'red' });
      return;
    }
    userProfile.is2FAEnabled = false;
    userProfile.isTOTPVerified = false;
    await chrome.storage.local.set({
      [STORAGE_KEYS.user2FAInfo]: userProfile,
    });
    setIs2FAEnabled(false);
    notifications.show({ message: '2FA revoked successfully' });
  };

  const handle2FASetupClick = () => {
    if (is2FAEnabled) {
      handle2FARevoke();
    } else {
      setShow2FASetup(true);
    }
  };

  const handleClose2FASetup = () => {
    setShow2FASetup(false);
  };

  return (
    <Flex align="center" justify="space-between">
      <Text>Two factor Authentication</Text>
      <Button
        radius="xl"
        color={is2FAEnabled ? 'teal' : 'red'}
        onClick={handle2FASetupClick}
      >
        <strong>{is2FAEnabled ? 'Revoke' : 'Enable'}</strong>
      </Button>
      <Setup2FA handleClose={handleClose2FASetup} isOpen={show2FASetup} />
    </Flex>
  );
}

export default TwoFactorAuth;
