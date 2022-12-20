import { Box, FormControlLabel } from '@mui/material';
import { StyledSwitch } from '@components/StyledComponents';
import { memo, useEffect, useState } from 'react';
import { IHandleSettingsChange } from '../containers/SettingsPanel';

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
      <FormControlLabel
        disabled={isUpdatingSettings}
        control={
          <StyledSwitch
            sx={{ mr: '6px' }}
            checked={hasConsent}
            onChange={handleToggle}
          />
        }
        label={<Box>Allow to Manage Google Activity</Box>}
        labelPlacement="start"
        sx={{
          mt: '4px',
          ml: 0,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      />
    );
  }
);
ManageGoogleActivityConsent.displayName = 'ManageGoogleActivityConsent';

export default ManageGoogleActivityConsent;
