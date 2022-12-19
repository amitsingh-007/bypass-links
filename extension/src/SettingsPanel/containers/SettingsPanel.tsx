import { FIREBASE_DB_REF } from '@bypass/shared/constants/firebase';
import { Box } from '@mui/material';
import { getSettings } from 'GlobalHelpers/fetchFromStorage';
import { saveToFirebase } from 'GlobalHelpers/firebase/database';
import { memo, useEffect, useState } from 'react';
import Header from '../components/Header';
import ManageGoogleActivityConsent from '../components/ManageGoogleActivityConsent';
import TwoFactorAuth from '../components/TwoFactorAuth';
import { ISettings } from '../interfaces/settings';
import { syncSettingsToStorage } from '../utils/sync';

const defaultSettings: ISettings = {
  hasManageGoogleActivityConsent: false,
};

export type IHandleSettingsChange = <K extends keyof ISettings>(newSettings: {
  [P in K]: ISettings[P];
}) => Promise<void>;

const SettingsPanel = memo(function SettingsPanel() {
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settings, setSettings] = useState<ISettings>(defaultSettings);

  const initSettings = async () => {
    setIsUpdatingSettings(true);
    const settings = await getSettings();
    setSettings(settings);
    setIsUpdatingSettings(false);
  };

  useEffect(() => {
    initSettings();
  }, []);

  const handleSettingsChange: IHandleSettingsChange = async (newSettings) => {
    const consolidatedSettings = { ...settings, ...newSettings };
    const isSuccess = await saveToFirebase(
      FIREBASE_DB_REF.settings,
      consolidatedSettings
    );
    if (isSuccess) {
      await syncSettingsToStorage();
    }
    await initSettings();
  };

  return (
    <Box sx={{ width: '400px', height: '400px' }}>
      <Header />
      <Box sx={{ p: '14px 16px' }}>
        <TwoFactorAuth />
        <ManageGoogleActivityConsent
          hasManageGoogleActivityConsent={
            settings.hasManageGoogleActivityConsent
          }
          handleSettingsChange={handleSettingsChange}
          isUpdatingSettings={isUpdatingSettings}
        />
      </Box>
    </Box>
  );
});

export default SettingsPanel;
