import bookmarkRowStyles from '@bypass/shared/styles/bookmarks/styles.module.css';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Center,
  Container,
  Modal,
} from '@mantine/core';
import clsx from 'clsx';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AiFillEdit } from 'react-icons/ai';
import DynamicContext from '../../../provider/DynamicContext';
import Bookmark from '../../Bookmarks/components/Bookmark';
import useBookmark from '../../Bookmarks/hooks/useBookmark';
import { getDecodedBookmark } from '../../Bookmarks/utils';
import { getBookmarksPanelUrl } from '../../Bookmarks/utils/url';
import Header from '../../Header';
import { ModifiedBookmark } from '../interfaces/bookmark';
import { getFilteredModifiedBookmarks } from '../utils/bookmark';
import styles from './styles/BookmarksList.module.css';
import { EBookmarkOperation } from '../../Bookmarks/constants';
import usePerson from '../hooks/usePerson';
import { IPerson } from '../interfaces/persons';

interface Props {
  personToOpen: IPerson | undefined;
  imageUrl: string;
  onLinkOpen: (url: string) => void;
  fullscreen: boolean;
}

const BookmarksList = memo<Props>(function BookmarksList({
  personToOpen,
  imageUrl,
  onLinkOpen,
  fullscreen,
}) {
  const { location } = useContext(DynamicContext);
  const { getBookmarkFromHash, getFolderFromHash } = useBookmark();
  const { getPersonTaggedUrls } = usePerson();
  const [bookmarks, setBookmarks] = useState<ModifiedBookmark[]>([]);
  const [searchText, setSearchText] = useState('');

  const initBookmarks = useCallback(async () => {
    const taggedUrls = await getPersonTaggedUrls(personToOpen?.uid ?? '');
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
  }, [
    getBookmarkFromHash,
    getFolderFromHash,
    getPersonTaggedUrls,
    personToOpen?.uid,
  ]);

  const handleBookmarkEdit = ({ url, parentName }: ModifiedBookmark) => {
    location.push(
      getBookmarksPanelUrl({
        operation: EBookmarkOperation.EDIT,
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
          <Box className={styles.header}>
            <Avatar src={imageUrl} alt={personToOpen?.name} radius="xl" />
            <Badge size="lg" radius="lg" maw="50%">{`${name} (${
              filteredBookmarks?.length || 0
            })`}</Badge>
          </Box>
        }
      />
      {filteredBookmarks.length > 0 ? (
        filteredBookmarks.map((bookmark) => (
          <Center
            key={bookmark.url}
            pos="relative"
            w="100%"
            className={clsx(
              bookmarkRowStyles.bookmarkRow,
              styles.bookmarkContainer
            )}
          >
            <ActionIcon
              size="2rem"
              title="Edit Bookmark"
              color="red"
              onClick={() => handleBookmarkEdit(bookmark)}
              radius="xl"
            >
              <AiFillEdit size="1.125rem" />
            </ActionIcon>
            <Box className={styles.bookmarkWrapper}>
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
      opened={!!personToOpen}
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
