import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { getBookmarksPanelUrl } from '@bypass/shared';
import { Button } from '@mantine/core';
import { memo } from 'react';
import { RiBookmarkFill } from 'react-icons/ri';
import { useLocation } from 'wouter';

const BookmarksPanelButton = memo(function BookmarksPanelButton() {
  const [, navigate] = useLocation();
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
