import { ROUTES } from '@bypass/shared';
import { Button } from '@bypass/ui';
import { FaUserTag } from 'react-icons/fa';
import { useLocation } from 'wouter';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

function PersonsPanelButton() {
  const [, navigate] = useLocation();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);

  const handleShowPersonsPanel = () => {
    navigate(ROUTES.PERSONS_PANEL);
  };

  return (
    <Button
      className="w-full"
      variant="secondary"
      disabled={!isSignedIn}
      onClick={handleShowPersonsPanel}
    >
      Persons
      <FaUserTag className="ml-2 size-4" />
    </Button>
  );
}

export default PersonsPanelButton;
