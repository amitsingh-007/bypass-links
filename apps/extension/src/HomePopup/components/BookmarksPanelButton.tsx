import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { getBookmarksPanelUrl } from '@bypass/shared';
import { Button } from '@mantine/core';
import { RiBookmarkFill } from '@react-icons/all-files/ri/RiBookMarkFill';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const BookmarksPanelButton = memo(function BookmarksPanelButton() {
  const navigate = useNavigate();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);

  const handleShowEditPanel = () => {
    navigate(getBookmarksPanelUrl({}));
  };

  return (
    <Button
      radius="xl"
      disabled={!isSignedIn}
      onClick={handleShowEditPanel}
      rightSection={<RiBookmarkFill />}
      fullWidth
    >
      Bookmarks
    </Button>
  );
});

export default BookmarksPanelButton;
