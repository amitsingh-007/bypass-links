import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Center,
  Container,
  Modal,
} from '@mantine/core';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AiFillEdit } from 'react-icons/ai';
import Bookmark from '../../Bookmarks/components/Bookmark';
import { BOOKMARK_OPERATION } from '../../Bookmarks/constants';
import { getBookmarksPanelUrl } from '../../Bookmarks/utils/url';
import Header from '../../Header';
import DynamicContext from '../../../provider/DynamicContext';
import { bookmarkRowStyles } from '../../Bookmarks/constants/styles';
import useBookmark from '../../Bookmarks/hooks/useBookmark';
import { getDecodedBookmark } from '../../Bookmarks/utils';
import { ModifiedBookmark } from '../interfaces/bookmark';
import { getFilteredModifiedBookmarks } from '../utils/bookmark';
import { getMediaQuery } from '../../../utils/mediaQuery';

interface Props {
  name?: string;
  imageUrl: string;
  taggedUrls?: string[];
  onLinkOpen: (url: string) => void;
  fullscreen: boolean;
  isOpen: boolean;
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
  const [searchText, setSearchText] = useState('');

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
        } satisfies ModifiedBookmark;
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

  const filteredBookmarks = useMemo(
    () => getFilteredModifiedBookmarks(bookmarks, searchText),
    [bookmarks, searchText]
  );

  const renderContent = () => (
    <>
      <Header
        onSearchChange={setSearchText}
        rightContent={
          <Box
            sx={(theme) =>
              getMediaQuery(theme, { display: ['none', 'contents'] })
            }
          >
            <Avatar src={imageUrl} alt={name} radius={999} />
            <Badge size="lg" radius="lg" maw="50%">{`${name} (${
              filteredBookmarks?.length || 0
            })`}</Badge>
          </Box>
        }
      />
      {filteredBookmarks.length > 0 ? (
        filteredBookmarks.map((bookmark) => (
          <Center
            pos="relative"
            w="100%"
            sx={[{ cursor: 'pointer', userSelect: 'none' }, bookmarkRowStyles]}
            key={bookmark.url}
          >
            <ActionIcon
              size="2rem"
              title="Edit Bookmark"
              color="red"
              onClick={() => {
                handleBookmarkEdit(bookmark);
              }}
              radius={999}
            >
              <AiFillEdit size="1.125rem" />
            </ActionIcon>
            <Box sx={{ flex: 1 }}>
              <Bookmark
                url={bookmark.url}
                title={bookmark.title}
                taggedPersons={bookmark.taggedPersons}
                onOpenLink={onLinkOpen}
              />
            </Box>
            <Badge size="sm" color="violet">
              {bookmark.parentName}
            </Badge>
          </Center>
        ))
      ) : (
        <Box ta="center" mt="1.875rem">
          No tagged bookmarks found
        </Box>
      )}
    </>
  );

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      fullScreen
      zIndex={1002}
      withCloseButton={false}
      styles={{
        body: { padding: 0 },
        title: { flex: 1, marginRight: 0 },
        header: { marginBottom: 0 },
      }}
    >
      {fullscreen ? (
        renderContent()
      ) : (
        <Container size="md" px={0}>
          {renderContent()}
        </Container>
      )}
    </Modal>
  );
});

export default BookmarksList;
