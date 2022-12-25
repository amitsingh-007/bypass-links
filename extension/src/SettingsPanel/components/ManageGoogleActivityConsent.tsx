import { Box, FormControlLabel } from '@mui/material';
import { StyledSwitch } from '@components/StyledComponents';
import { memo, useEffect, useState } from 'react';
import { IHandleSettingsChange } from './SettingsPanel';
import { Flex, Switch, Text } from '@mantine/core';

interface Props {
  hasManageGoogleActivityConsent: boolean;
  handleSettingsChange: IHandleSettingsChange;
  isUpdatingSettings: boolean;
}

const ManageGoogleActivityConsent = memo<Props>(
  ({
    hasManageGoogleActivityConsent,
    handleSettingsChange,
    isUpdatingSettings,
  }) => {
    const [hasConsent, setHasConsent] = useState(
      hasManageGoogleActivityConsent
    );

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
  }
);
ManageGoogleActivityConsent.displayName = 'ManageGoogleActivityConsent';

export default ManageGoogleActivityConsent;
