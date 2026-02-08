import { getBookmarksPanelUrl } from '@bypass/shared';
import { Button } from '@mantine/core';
import { RiBookmarkFill } from 'react-icons/ri';
import { useLocation } from 'wouter';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

function BookmarksPanelButton() {
  const [, navigate] = useLocation();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);

  const handleShowEditPanel = () => {
    navigate(getBookmarksPanelUrl({}));
  };

  return (
    <Button
      fullWidth
      radius="xl"
      disabled={!isSignedIn}
      rightSection={<RiBookmarkFill />}
      onClick={handleShowEditPanel}
    >
      Bookmarks
    </Button>
  );
}

export default BookmarksPanelButton;
