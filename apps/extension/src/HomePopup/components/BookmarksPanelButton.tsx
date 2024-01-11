import { getBookmarksPanelUrl } from '@bypass/shared';
import { Button } from '@mantine/core';
import useAuthStore from '@store/auth';
import { memo } from 'react';
import { RiBookMarkFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const BookmarksPanelButton = memo(function BookmarksPanelButton() {
  const navigate = useNavigate();
  const isSignedIn = useAuthStore((state) => state.isSignedIn);

  const handleShowEditPanel = () => {
    navigate(getBookmarksPanelUrl({}));
  };

  return (
    <Button
      radius="xl"
      disabled={!isSignedIn}
      onClick={handleShowEditPanel}
      rightSection={<RiBookMarkFill />}
      fullWidth
    >
      Bookmarks
    </Button>
  );
});

export default BookmarksPanelButton;
