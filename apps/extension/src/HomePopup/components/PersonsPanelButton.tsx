import { ROUTES } from '@bypass/shared';
import { Button } from '@mantine/core';
import useAuthStore from '@store/auth';
import { memo } from 'react';
import { FaUserTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PersonsPanelButton = memo(function PersonsPanelButton() {
  const navigate = useNavigate();
  const isSignedIn = useAuthStore((state) => state.isSignedIn);

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
});

export default PersonsPanelButton;
