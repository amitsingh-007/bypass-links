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
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import DynamicContext from '../../../provider/DynamicContext';
import Bookmark from '../../Bookmarks/components/Bookmark';
import { EBookmarkOperation } from '../../Bookmarks/constants';
import useBookmark from '../../Bookmarks/hooks/useBookmark';
import { getDecryptedBookmark } from '../../Bookmarks/utils';
import { getBookmarksPanelUrl } from '../../Bookmarks/utils/url';
import Header from '../../Header';
import usePerson from '../hooks/usePerson';
import { type IBookmarkWithFolder } from '../interfaces/bookmark';
import { type IPerson } from '../interfaces/persons';
import {
  getFilteredModifiedBookmarks,
  getOrderedBookmarksList,
} from '../utils/bookmark';
import styles from './styles/BookmarksList.module.css';
import bookmarkRowStyles from '@bypass/shared/styles/bookmarks/styles.module.css';

interface Props {
  personToOpen: IPerson | undefined;
  imageUrl: string;
  onLinkOpen: (url: string) => void;
  fullscreen: boolean;
}

function BookmarksList({
  personToOpen,
  imageUrl,
  onLinkOpen,
  fullscreen,
}: Props) {
  const { location } = useContext(DynamicContext);
  const { getBookmarkFromHash, getFolderFromHash, getDefaultOrRootFolderUrls } =
    useBookmark();
  const { getPersonTaggedUrls } = usePerson();
  const [bookmarks, setBookmarks] = useState<IBookmarkWithFolder[]>([]);
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
        const decodedBookmark = getDecryptedBookmark(bookmark);
        return {
          ...decodedBookmark,
          parentName: parent.name,
          parentId: parent.id,
        } satisfies IBookmarkWithFolder;
      })
    );

    const defaultUrls = await getDefaultOrRootFolderUrls();
    const orderedBookmarks = getOrderedBookmarksList(
      fetchedBookmarks,
      defaultUrls
    );

    setBookmarks(orderedBookmarks);
  }, [
    getBookmarkFromHash,
    getDefaultOrRootFolderUrls,
    getFolderFromHash,
    getPersonTaggedUrls,
    personToOpen?.uid,
  ]);

  const handleBookmarkEdit = ({ url, parentId }: IBookmarkWithFolder) => {
    location.push(
      getBookmarksPanelUrl({
        operation: EBookmarkOperation.EDIT,
        bmUrl: url,
        folderId: parentId,
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
        rightContent={
          <Box className={styles.header}>
            <Avatar src={imageUrl} alt={personToOpen?.name} radius="xl" />
            <Badge size="lg" radius="lg" maw="50%">{`${personToOpen?.name} (${
              filteredBookmarks?.length || 0
            })`}</Badge>
          </Box>
        }
        onSearchChange={setSearchText}
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
              radius="xl"
              onClick={() => handleBookmarkEdit(bookmark)}
            >
              <AiFillEdit size="1.125rem" />
            </ActionIcon>
            <Box className={styles.bookmarkWrapper}>
              <Bookmark
                id={bookmark.id}
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
      fullScreen
      opened={Boolean(personToOpen)}
      zIndex={1002}
      withCloseButton={false}
      styles={{
        body: { padding: 0 },
        title: { flex: 1, marginRight: 0 },
        header: { marginBottom: 0 },
      }}
      onClose={handleClose}
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
}

export default BookmarksList;
