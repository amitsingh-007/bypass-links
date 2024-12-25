import { trpcApi } from '@/apis/trpcApi';
import { Header, ISettings } from '@bypass/shared';
import { getSettings } from '@helpers/fetchFromStorage';
import { Box, Flex } from '@mantine/core';
import { useEffect, useState } from 'react';
import { syncSettingsToStorage } from '../utils/sync';
import ManageGoogleActivityConsent from './ManageGoogleActivityConsent';
import TwoFactorAuth from './TwoFactorAuth';

const defaultSettings: ISettings = {
  hasManageGoogleActivityConsent: false,
};

export type IHandleSettingsChange = <K extends keyof ISettings>(newSettings: {
  [P in K]: ISettings[P];
}) => Promise<void>;

const SettingsPanel = () => {
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settings, setSettings] = useState<ISettings>(defaultSettings);

  const initSettings = async () => {
    setIsUpdatingSettings(true);
    const settingsData = await getSettings();
    setSettings(settingsData);
    setIsUpdatingSettings(false);
  };

  useEffect(() => {
    initSettings();
  }, []);

  const handleSettingsChange: IHandleSettingsChange = async (newSettings) => {
    const consolidatedSettings = { ...settings, ...newSettings };
    const isSuccess =
      await trpcApi.firebaseData.settingsPost.mutate(consolidatedSettings);
    if (isSuccess) {
      await syncSettingsToStorage();
    }
    await initSettings();
  };

  return (
    <Box w="25rem" h="25rem">
      <Header text="Settings" />
      <Flex direction="column" gap="xs" p="0.875rem 1rem">
        <TwoFactorAuth />
        <ManageGoogleActivityConsent
          hasManageGoogleActivityConsent={
            settings.hasManageGoogleActivityConsent
          }
          handleSettingsChange={handleSettingsChange}
          isUpdatingSettings={isUpdatingSettings}
        />
      </Flex>
    </Box>
  );
};

export default SettingsPanel;
