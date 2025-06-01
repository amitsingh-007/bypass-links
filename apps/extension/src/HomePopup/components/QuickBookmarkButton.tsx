import {
  type BMPanelQueryParams,
  DEFAULT_BOOKMARK_FOLDER,
  EBookmarkOperation,
  getBookmarksPanelUrl,
  getDecryptedBookmark,
  type IEncodedBookmark,
  useBookmark,
} from '@bypass/shared';
import { getBookmarks } from '@helpers/fetchFromStorage';
import { Button, Text, Tooltip } from '@mantine/core';
import md5 from 'md5';
import { useEffect, useState } from 'react';
import { BiBookmarkPlus } from 'react-icons/bi';
import { RiBookmark3Fill } from 'react-icons/ri';
import { useLocation } from 'wouter';
import { getCurrentTab } from '@/utils/tabs';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

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
    const bookmarks = await getBookmarks();
    if (bookmarks) {
      const encodedBookmark = bookmarks.urlList[md5(url)];
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
      urlParams.folderContext = parent.name;
    } else {
      const { url } = await getCurrentTab();
      urlParams.operation = EBookmarkOperation.ADD;
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
}

export default QuickBookmarkButton;
