import { ROUTES } from '@bypass/shared';
import { Button } from '@mantine/core';
import useExtStore from '@store/extension';
import { memo } from 'react';
import { RiHistoryFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const HistoryPanelButton = memo(function HistoryPanelButton() {
  const navigate = useNavigate();
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);

  const handleShowHistoryPanel = () => {
    navigate(ROUTES.HISTORY_PANEL);
  };

  return (
    <Button
      radius="xl"
      disabled={!isExtensionActive}
      onClick={handleShowHistoryPanel}
      rightSection={<RiHistoryFill />}
      fullWidth
    >
      History
    </Button>
  );
});

export default HistoryPanelButton;
