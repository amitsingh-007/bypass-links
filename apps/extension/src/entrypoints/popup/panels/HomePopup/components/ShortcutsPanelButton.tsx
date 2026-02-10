import { ROUTES } from '@bypass/shared';
import { Button } from '@bypass/ui';
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
      className="w-full"
      variant="secondary"
      disabled={!isSignedIn}
      onClick={handleOpenShortcutsPanel}
    >
      Shortcuts
      <GoFileSymlinkFile className="ml-2 size-4" />
    </Button>
  );
}

export default ShortcutsPanelButton;
