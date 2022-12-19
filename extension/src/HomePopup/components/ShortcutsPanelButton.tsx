import { SvgIcon } from '@mui/material';
import { ROUTES } from '@bypass/shared/constants/routes';
import { memo } from 'react';
import { GoFileSymlinkFile } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import StyledButton from './StyledButton';
import useAuthStore from 'GlobalStore/auth';

const ShortcutsPanelButton = memo(function ShortcutsPanelButton() {
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const navigate = useNavigate();

  const handleOpenShortcutsPanel = () => {
    navigate(ROUTES.SHORTCUTS_PANEL);
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isDisabled={!isSignedIn}
      onClick={handleOpenShortcutsPanel}
      color="secondary"
    >
      <SvgIcon>
        <GoFileSymlinkFile />
      </SvgIcon>
    </StyledButton>
  );
});

export default ShortcutsPanelButton;
