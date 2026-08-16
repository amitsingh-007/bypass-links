import {
  type BMPanelQueryParams,
  ROOT_FOLDER_ID,
  EBookmarkOperation,
  getBookmarksPanelUrl,
  useBookmark,
} from '@bypass/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@bypass/ui';
import {
  BookmarkRemove01Icon,
  BookmarkAdd01Icon,
} from '@hugeicons/core-free-icons';
import { useLocation } from 'wouter';

import { useIsSignedIn } from '@/store/firebase/useFirebaseStore';
import useCurrentTab from '@popup/hooks/useCurrentTab';
import useQuickBookmark from '@popup/hooks/useQuickBookmark';

import HomeActionButton from './HomeActionButton';

function QuickBookmarkButton() {
  const [, navigate] = useLocation();
  const isSignedIn = useIsSignedIn();
  const { getFolderFromHash } = useBookmark();
  const currentTab = useCurrentTab();
  const currentUrl = currentTab?.url ?? '';
  const { data: bookmark, isLoading: isFetching } = useQuickBookmark(
    isSignedIn,
    currentUrl
  );

  const handleClick = async () => {
    const urlParams: Partial<BMPanelQueryParams> = {};
    if (bookmark) {
      const { url, parentHash } = bookmark;
      const parent = await getFolderFromHash(parentHash);
      urlParams.operation = EBookmarkOperation.EDIT;
      urlParams.bmUrl = url;
      urlParams.folderId = parent.id;
    } else {
      urlParams.operation = EBookmarkOperation.ADD;
      urlParams.bmUrl = currentUrl;
      urlParams.folderId = ROOT_FOLDER_ID;
    }
    navigate(getBookmarksPanelUrl(urlParams));
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <HomeActionButton
          label={bookmark ? 'Unpin' : 'Pin'}
          icon={bookmark ? BookmarkRemove01Icon : BookmarkAdd01Icon}
          variant={bookmark ? 'default' : 'outline'}
          isBusy={isFetching}
          testId="quick-bookmark-button"
          onClick={handleClick}
        />
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
