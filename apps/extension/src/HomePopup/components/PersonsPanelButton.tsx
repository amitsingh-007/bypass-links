import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { ROUTES } from '@bypass/shared';
import { Button } from '@mantine/core';
import { FaUserTag } from 'react-icons/fa';
import { useLocation } from 'wouter';

const PersonsPanelButton = () => {
  const [, navigate] = useLocation();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);

  const handleShowPersonsPanel = () => {
    navigate(ROUTES.PERSONS_PANEL);
  };

  return (
    <Button
      radius="xl"
      disabled={!isSignedIn}
      onClick={handleShowPersonsPanel}
      rightSection={<FaUserTag />}
      fullWidth
    >
      Persons
    </Button>
  );
};

export default PersonsPanelButton;
