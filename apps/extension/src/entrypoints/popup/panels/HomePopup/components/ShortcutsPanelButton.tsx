import { ROUTES } from '@bypass/shared';
import { Button } from '@mantine/core';
import { GoFileSymlinkFile } from 'react-icons/go';
import { useLocation } from 'wouter';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

function ShortcutsPanelButton() {
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const [, navigate] = useLocation();

  const handleOpenShortcutsPanel = () => {
    navigate(ROUTES.SHORTCUTS_PANEL);
  };

  return (
    <Button
      fullWidth
      radius="xl"
      disabled={!isSignedIn}
      rightSection={<GoFileSymlinkFile />}
      onClick={handleOpenShortcutsPanel}
    >
      Shortcuts
    </Button>
  );
}

export default ShortcutsPanelButton;
