import { SvgIcon } from '@mui/material';
import { memo } from 'react';
import { RiBookMarkFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { getBookmarksPanelUrl } from '@bypass/shared/components/Bookmarks/utils/url';
import StyledButton from './StyledButton';
import useAuthStore from '@store/auth';

const BookmarksPanelButton = memo(function BookmarksPanelButton() {
  const navigate = useNavigate();
  const isSignedIn = useAuthStore((state) => state.isSignedIn);

  const handleShowEditPanel = () => {
    navigate(getBookmarksPanelUrl({}));
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isDisabled={!isSignedIn}
      onClick={handleShowEditPanel}
    >
      <SvgIcon>
        <RiBookMarkFill />
      </SvgIcon>
    </StyledButton>
  );
});

export default BookmarksPanelButton;
