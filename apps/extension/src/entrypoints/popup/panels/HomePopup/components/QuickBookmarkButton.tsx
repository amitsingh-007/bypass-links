import {
  type BMPanelQueryParams,
  ROOT_FOLDER_ID,
  EBookmarkOperation,
  getBookmarksPanelUrl,
  getDecryptedBookmark,
  type IEncodedBookmark,
  useBookmark,
} from '@bypass/shared';
import {
  Button,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@bypass/ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookmarkRemove01Icon,
  BookmarkAdd01Icon,
} from '@hugeicons/core-free-icons';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { findBookmarkByUrl } from '../../BookmarksPanel/utils/bookmark';
import { getCurrentTab } from '@/utils/tabs';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { bookmarksItem } from '@/storage/items';

function QuickBookmarkButton() {
  const [, navigate] = useLocation();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const { getFolderFromHash } = useBookmark();
  const [bookmark, setBookmark] = useState<IEncodedBookmark>();
  const [isFetching, setIsFetching] = useState(false);

  const initBookmark = async () => {
    setIsFetching(true);
    const currentTab = await getCurrentTab();
    const url = currentTab?.url ?? '';
    const bookmarks = await bookmarksItem.getValue();
    if (bookmarks) {
      const encodedBookmark = findBookmarkByUrl(bookmarks.urlList, url);
      if (encodedBookmark) {
        const decodedBookmark = getDecryptedBookmark(encodedBookmark);
        setBookmark(decodedBookmark);
      }
    }
    setIsFetching(false);
  };

  useEffect(() => {
    setIsFetching(isSignedIn);
    if (isSignedIn) {
      initBookmark();
    }
  }, [isSignedIn]);

  const handleClick = async () => {
    const urlParams: Partial<BMPanelQueryParams> = {};
    if (bookmark) {
      const { url, parentHash } = bookmark;
      const parent = await getFolderFromHash(parentHash);
      urlParams.operation = EBookmarkOperation.EDIT;
      urlParams.bmUrl = url;
      urlParams.folderId = parent.id;
    } else {
      const { url } = await getCurrentTab();
      urlParams.operation = EBookmarkOperation.ADD;
      urlParams.bmUrl = url;
      urlParams.folderId = ROOT_FOLDER_ID;
    }
    navigate(getBookmarksPanelUrl(urlParams));
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          className="w-full"
          variant={bookmark ? 'default' : 'outline'}
          disabled={!isSignedIn || isFetching}
          data-testid="quick-bookmark-button"
          onClick={handleClick}
        >
          {isFetching && <Spinner className="mr-2 size-4 animate-spin" />}
          {bookmark ? 'Unpin' : 'Pin'}
          <HugeiconsIcon
            icon={bookmark ? BookmarkRemove01Icon : BookmarkAdd01Icon}
            strokeWidth={2}
            className="ml-2 size-4"
          />
        </Button>
      </TooltipTrigger>
      {bookmark && (
        <TooltipContent>
          <p className="text-xs">{bookmark.title}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export default QuickBookmarkButton;
