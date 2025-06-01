import { ROUTES } from '@bypass/shared';
import { Button } from '@mantine/core';
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
      fullWidth
      radius="xl"
      disabled={!isSignedIn}
      rightSection={<FaUserTag />}
      onClick={handleShowPersonsPanel}
    >
      Persons
    </Button>
  );
}

export default PersonsPanelButton;
