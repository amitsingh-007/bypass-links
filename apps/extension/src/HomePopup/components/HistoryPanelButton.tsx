import { ROUTES } from '@bypass/shared';
import { Button } from '@mantine/core';
import useExtStore from '@store/extension';
import { RiHistoryFill } from 'react-icons/ri';
import { useLocation } from 'wouter';

const HistoryPanelButton = () => {
  const [, navigate] = useLocation();
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
};

export default HistoryPanelButton;
