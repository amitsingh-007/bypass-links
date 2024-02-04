import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { ROUTES } from '@bypass/shared';
import { Button } from '@mantine/core';
import { memo } from 'react';
import { GoFileSymlinkFile } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';

const ShortcutsPanelButton = memo(function ShortcutsPanelButton() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const navigate = useNavigate();

  const handleOpenShortcutsPanel = () => {
    navigate(ROUTES.SHORTCUTS_PANEL);
  };

  return (
    <Button
      radius="xl"
      disabled={!isSignedIn}
      onClick={handleOpenShortcutsPanel}
      rightSection={<GoFileSymlinkFile />}
      fullWidth
    >
      Shortcuts
    </Button>
  );
});

export default ShortcutsPanelButton;
