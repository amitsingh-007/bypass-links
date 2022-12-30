import { ROUTES } from '@bypass/shared/constants/routes';
import { Button } from '@mantine/core';
import useAuthStore from '@store/auth';
import { memo } from 'react';
import { GoFileSymlinkFile } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';

const ShortcutsPanelButton = memo(function ShortcutsPanelButton() {
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const navigate = useNavigate();

  const handleOpenShortcutsPanel = () => {
    navigate(ROUTES.SHORTCUTS_PANEL);
  };

  return (
    <Button
      variant="light"
      radius="xl"
      loaderPosition="right"
      disabled={!isSignedIn}
      onClick={handleOpenShortcutsPanel}
      rightIcon={<GoFileSymlinkFile />}
      fullWidth
    >
      Shortcuts
    </Button>
  );
});

export default ShortcutsPanelButton;
