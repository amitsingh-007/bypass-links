import { ActionIcon, Avatar, Badge, Box, Center, Modal } from '@mantine/core';
import { Button, IconButton } from '@mui/material';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { MdModeEdit } from 'react-icons/md';
import Bookmark from '../../../components/Bookmarks/components/Bookmark';
import {
  bookmarkRowStyles,
  BOOKMARK_OPERATION,
} from '../../../components/Bookmarks/constants';
import { IBookmark } from '../../../components/Bookmarks/interfaces';
import { getBookmarksPanelUrl } from '../../../components/Bookmarks/utils/url';
import Header from '../../../components/Header';
import DynamicContext from '../../../provider/DynamicContext';
import useBookmark from '../../Bookmarks/hooks/useBookmark';
import { getDecodedBookmark } from '../../Bookmarks/utils';
import SearchWrapper from '../../SearchWrapper';

interface Props {
  name?: string;
  imageUrl: string;
  taggedUrls?: string[];
  onLinkOpen: (url: string) => void;
  fullscreen: boolean;
  isOpen: boolean;
}

interface ModifiedBookmark extends IBookmark {
  parentName: string;
}

const BookmarksList = memo<Props>(function BookmarksList({
  name,
  imageUrl,
  taggedUrls,
  onLinkOpen,
  fullscreen,
  isOpen,
}) {
  const { location } = useContext(DynamicContext);
  const { getBookmarkFromHash, getFolderFromHash } = useBookmark();
  const [bookmarks, setBookmarks] = useState<ModifiedBookmark[]>([]);

  const initBookmarks = useCallback(async () => {
    if (!taggedUrls?.length) {
      return;
    }
    const fetchedBookmarks = await Promise.all(
      taggedUrls.map(async (urlHash) => {
        const bookmark = await getBookmarkFromHash(urlHash);
        const parent = await getFolderFromHash(bookmark.parentHash);
        const decodedBookmark = getDecodedBookmark(bookmark);
        return {
          ...decodedBookmark,
          parentName: atob(parent.name),
        } as ModifiedBookmark;
      })
    );
    setBookmarks(fetchedBookmarks);
  }, [getBookmarkFromHash, getFolderFromHash, taggedUrls]);

  const handleBookmarkEdit = async ({ url, parentName }: ModifiedBookmark) => {
    location.push(
      getBookmarksPanelUrl({
        operation: BOOKMARK_OPERATION.EDIT,
        bmUrl: url,
        folderContext: parentName,
      })
    );
  };

  const handleClose = () => {
    location.goBack();
  };

  useEffect(() => {
    initBookmarks();
    return () => {
      setBookmarks([]);
    };
  }, [initBookmarks]);

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      fullScreen
      zIndex={1002}
      withCloseButton={false}
      styles={{
        modal: { padding: '0 !important' },
        title: { flex: 1, marginRight: 0 },
        header: { marginBottom: 0 },
      }}
    >
      <Header
        rightContent={
          <>
            <SearchWrapper searchClassName="bookmarkRowContainer" />
            <Avatar src={imageUrl} alt={name} radius={999} />
            <Badge size="lg" radius="lg" sx={{ maxWidth: '50%' }}>{`${name} (${
              bookmarks?.length || 0
            })`}</Badge>
          </>
        }
      />
      {bookmarks.length > 0 ? (
        bookmarks.map((bookmark) => (
          <Center
            sx={{
              position: 'relative',
              width: '100%',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            className="bookmarkRowContainer"
            data-text={bookmark.url}
            data-subtext={bookmark.title}
            key={bookmark.url}
          >
            <ActionIcon
              size={32}
              title="Edit Bookmark"
              color="red"
              onClick={() => {
                handleBookmarkEdit(bookmark);
              }}
              radius={999}
              mr="4px"
            >
              <MdModeEdit size="18px" />
            </ActionIcon>
            <Bookmark
              url={bookmark.url}
              title={bookmark.title}
              taggedPersons={bookmark.taggedPersons}
              containerStyles={{
                ...bookmarkRowStyles,
                paddingLeft: '0px',
                overflowX: 'hidden',
                width: 'unset',
                flex: 1,
              }}
              onOpenLink={onLinkOpen}
            />
            <Badge size="sm" color="violet">
              {bookmark.parentName}
            </Badge>
          </Center>
        ))
      ) : (
        <Box ta="center" mt="30px">
          No tagged bookmarks found
        </Box>
      )}
    </Modal>
  );
});

export default BookmarksList;
