import { Header } from '@bypass/shared';
import { Box, Flex } from '@mantine/core';
import TwoFactorAuth from './TwoFactorAuth';

function SettingsPanel() {
  return (
    <Box w="25rem" h="25rem">
      <Header text="Settings" />
      <Flex direction="column" gap="xs" p="0.875rem 1rem">
        <TwoFactorAuth />
      </Flex>
    </Box>
  );
}

export default SettingsPanel;
