import {
  Avatar,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@bypass/ui';
import { BookEditIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

interface Props {
  personToOpen: IPerson | undefined;
  imageUrl: string;
  onLinkOpen: (url: string) => void;
  fullscreen: boolean;
  showEditButton?: boolean;
  getFaviconUrl: (url: string) => string;
}

function BookmarksList({
  personToOpen,
  imageUrl,
  onLinkOpen,
  fullscreen,
  showEditButton,
  getFaviconUrl,
}: Props) {
  const { location } = useContext(DynamicContext);
  const { getBookmarkFromHash, getFolderFromHash, getDefaultOrRootFolderUrls } =
    useBookmark();
  const { getPersonTaggedUrls } = usePerson();
  const [bookmarks, setBookmarks] = useState<IBookmarkWithFolder[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initBookmarks = useCallback(async () => {
    setIsLoading(true);
    const taggedUrls = await getPersonTaggedUrls(personToOpen?.uid ?? '');
    if (!taggedUrls?.length) {
      setIsLoading(false);
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
    setIsLoading(false);
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
      setIsLoading(false);
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
          <div
            className="
              contents
              max-sm:hidden
            "
          >
            <Avatar>
              <AvatarImage src={imageUrl} alt={personToOpen?.name} />
            </Avatar>
            <Badge
              data-testid="person-bookmark-count-badge"
              className="h-8 max-w-[50%]"
              variant="secondary"
            >{`${personToOpen?.name} (${filteredBookmarks?.length || 0})`}</Badge>
          </div>
        }
        onSearchChange={setSearchText}
      />
      {isLoading ? (
        <div
          className="flex h-50 items-center justify-center"
          data-testid="bookmarks-loading"
        >
          <div>Loading bookmarks...</div>
        </div>
      ) : filteredBookmarks.length > 0 ? (
        filteredBookmarks.map((bookmark) => (
          <div
            key={bookmark.url}
            className="
              relative box-border flex h-8 w-full cursor-pointer items-center
              gap-2 rounded-md px-2 select-none
              hover:bg-muted
            "
            data-testid="bookmark-container"
          >
            {showEditButton && (
              <Button
                variant="secondary"
                size="icon-sm"
                title="Edit Bookmark"
                data-testid="edit-bookmark-button"
                onClick={() => handleBookmarkEdit(bookmark)}
              >
                <HugeiconsIcon icon={BookEditIcon} className="size-3.5" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <Bookmark
                id={bookmark.id}
                url={bookmark.url}
                title={bookmark.title}
                taggedPersons={bookmark.taggedPersons}
                getFaviconUrl={getFaviconUrl}
                onOpenLink={onLinkOpen}
              />
            </div>
            <Badge
              data-testid="folder-name-badge"
              variant="secondary"
              className="shrink-0"
            >
              {bookmark.parentName}
            </Badge>
          </div>
        ))
      ) : (
        <div className="mt-7.5 text-center" data-testid="no-bookmarks-message">
          No tagged bookmarks found
        </div>
      )}
    </>
  );

  return (
    <Dialog
      open={Boolean(personToOpen)}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent
        data-testid="bookmarks-list-modal"
        className="
          inset-0! block max-w-none! translate-0! overflow-hidden rounded-none
          p-0
        "
        showCloseButton={false}
      >
        <DialogHeader className="px-0">
          <DialogTitle className="sr-only">Bookmarks</DialogTitle>
        </DialogHeader>
        {fullscreen ? (
          renderContent()
        ) : (
          <div className="max-w-panel mx-auto px-0">{renderContent()}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BookmarksList;
