import { getBookmarksPanelUrl } from '@bypass/shared';
import { Button } from '@bypass/ui';
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
      className="w-full"
      variant="secondary"
      disabled={!isSignedIn}
      onClick={handleShowEditPanel}
    >
      Bookmarks
      <RiBookmarkFill className="ml-2 size-4" />
    </Button>
  );
}

export default BookmarksPanelButton;
