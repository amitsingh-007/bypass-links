import { SvgIcon } from '@mui/material';
import { ROUTES } from '@common/constants/routes';
import { memo } from 'react';
import { FaUserTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import StyledButton from './StyledButton';
import useAuthStore from 'GlobalStore/auth';

const PersonsPanelButton = memo(function PersonsPanelButton() {
  const navigate = useNavigate();
  const isSignedIn = useAuthStore((state) => state.isSignedIn);

  const handleShowPersonsPanel = () => {
    navigate(ROUTES.PERSONS_PANEL);
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isDisabled={!isSignedIn}
      onClick={handleShowPersonsPanel}
    >
      <SvgIcon>
        <FaUserTag />
      </SvgIcon>
    </StyledButton>
  );
});

export default PersonsPanelButton;
