import {
  type BMPanelQueryParams,
  ROOT_FOLDER_ID,
  EBookmarkOperation,
  getBookmarksPanelUrl,
  useBookmark,
} from '@bypass/shared';
import {
  Button,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@bypass/ui';
import {
  BookmarkRemove01Icon,
  BookmarkAdd01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useLocation } from 'wouter';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useQuickBookmark from '@popup/hooks/useQuickBookmark';
import { getCurrentTab } from '@popup/utils/tabs';

function QuickBookmarkButton() {
  const [, navigate] = useLocation();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const { getFolderFromHash } = useBookmark();
  const { data: bookmark, isLoading: isFetching } =
    useQuickBookmark(isSignedIn);

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
          className="w-full font-medium"
          variant={bookmark ? 'default' : 'outline'}
          disabled={!isSignedIn || isFetching}
          data-testid="quick-bookmark-button"
          onClick={handleClick}
        >
          {isFetching && <Spinner className="mr-2 size-4" />}
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
