import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import { getCurrentTab } from '@/utils/tabs';
import {
  BMPanelQueryParams,
  BOOKMARK_OPERATION,
  DEFAULT_BOOKMARK_FOLDER,
  getBookmarksPanelUrl,
  getDecodedBookmark,
  IEncodedBookmark,
  useBookmark,
} from '@bypass/shared';
import { getBookmarks } from '@helpers/fetchFromStorage';
import { Button, Text, Tooltip } from '@mantine/core';
import md5 from 'md5';
import { memo, useEffect, useState } from 'react';
import { BiBookmarkPlus } from 'react-icons/bi';
import { RiBookmark3Fill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const QuickBookmarkButton = memo(function QuickBookmarkButton() {
  const navigate = useNavigate();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const { getFolderFromHash } = useBookmark();
  const [bookmark, setBookmark] = useState<IEncodedBookmark | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const initBookmark = async () => {
    setIsFetching(true);
    const currentTab = await getCurrentTab();
    const url = currentTab?.url ?? '';
    const bookmarks = await getBookmarks();
    if (bookmarks) {
      const encodedBookmark = bookmarks.urlList[md5(url)];
      if (encodedBookmark) {
        const decodedBookmark = getDecodedBookmark(encodedBookmark);
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
      urlParams.operation = BOOKMARK_OPERATION.EDIT;
      urlParams.bmUrl = url;
      urlParams.folderContext = atob(parent.name);
    } else {
      const { url } = await getCurrentTab();
      urlParams.operation = BOOKMARK_OPERATION.ADD;
      urlParams.bmUrl = url;
      urlParams.folderContext = DEFAULT_BOOKMARK_FOLDER;
    }
    navigate(getBookmarksPanelUrl(urlParams));
  };

  return (
    <Tooltip
      label={<Text size="xs">{bookmark?.title}</Text>}
      disabled={!bookmark}
      withArrow
      multiline
      radius="md"
      color="gray"
    >
      <Button
        radius="xl"
        loading={isFetching}
        disabled={!isSignedIn}
        onClick={handleClick}
        rightSection={bookmark ? <RiBookmark3Fill /> : <BiBookmarkPlus />}
        fullWidth
        color={bookmark ? 'teal' : 'red'}
      >
        {bookmark ? 'Unpin' : 'Pin'}
      </Button>
    </Tooltip>
  );
});

export default QuickBookmarkButton;
