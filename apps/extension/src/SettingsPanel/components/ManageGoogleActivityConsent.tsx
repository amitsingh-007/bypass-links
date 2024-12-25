import { Flex, Switch, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IHandleSettingsChange } from './SettingsPanel';

interface Props {
  hasManageGoogleActivityConsent: boolean;
  handleSettingsChange: IHandleSettingsChange;
  isUpdatingSettings: boolean;
}

const ManageGoogleActivityConsent = ({
  hasManageGoogleActivityConsent,
  handleSettingsChange,
  isUpdatingSettings,
}: Props) => {
  const [hasConsent, setHasConsent] = useState(hasManageGoogleActivityConsent);

  useEffect(() => {
    setHasConsent(hasManageGoogleActivityConsent);
  }, [hasManageGoogleActivityConsent]);

  const handleToggle = async () => {
    const newConsent = !hasConsent;
    setHasConsent(newConsent);
    await handleSettingsChange({
      hasManageGoogleActivityConsent: newConsent,
    });
  };

  return (
    <Flex justify="space-between">
      <Text>Allow to Manage Google Activity</Text>
      <Switch
        onLabel="ON"
        offLabel="OFF"
        size="md"
        checked={hasConsent}
        color="teal"
        onChange={handleToggle}
        disabled={isUpdatingSettings}
      />
    </Flex>
  );
};

export default ManageGoogleActivityConsent;
