import { SvgIcon } from '@mui/material';
import { ROUTES } from '@bypass/common/constants/routes';
import { memo } from 'react';
import { RiHistoryFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import StyledButton from './StyledButton';
import useExtStore from 'GlobalStore/extension';

const HistoryPanelButton = memo(function HistoryPanelButton() {
  const navigate = useNavigate();
  const isExtensionActive = useExtStore((state) => state.isExtensionActive);

  const handleShowHistoryPanel = () => {
    navigate(ROUTES.HISTORY_PANEL);
  };

  return (
    <StyledButton
      showSuccessColor={isExtensionActive}
      isDisabled={!isExtensionActive}
      onClick={handleShowHistoryPanel}
    >
      <SvgIcon>
        <RiHistoryFill />
      </SvgIcon>
    </StyledButton>
  );
});

export default HistoryPanelButton;
