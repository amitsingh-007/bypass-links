import { getCurrentTab } from 'GlobalHelpers/chrome/tabs';
import { memo, useCallback, useEffect, useState } from 'react';
import { BOOKMARK_OPERATION } from '@bypass/shared/components/Bookmarks/constants';
import {
  ContextBookmark,
  ContextBookmarks,
} from '@bypass/shared/components/Bookmarks/interfaces';
import { getBookmarksPanelUrl } from '@bypass/shared/components/Bookmarks/utils/url';
import BookmarkDialog from './BookmarkDialog';
import { useNavigate } from 'react-router-dom';
import useBookmarkStore from 'GlobalStore/bookmark';

const heading = {
  [BOOKMARK_OPERATION.NONE]: '',
  [BOOKMARK_OPERATION.ADD]: 'Add bookmark',
  [BOOKMARK_OPERATION.EDIT]: 'Edit bookmark',
};

interface Props {
  folderNamesList: string[];
  curFolder: string;
  contextBookmarks: ContextBookmarks;
  handleScroll: (pos: number) => void;
  handleSelectedChange: (pos: number, isOnlySelection: boolean) => void;
  onSave: (
    url: string,
    newTitle: string,
    folder: string,
    newFolder: string,
    pos: number,
    taggedPersons: string[],
    newTaggedPersons: string[]
  ) => void;
  onDelete: (pos: number, url: string) => void;
}

const EditBookmark = memo<Props>(
  ({
    folderNamesList,
    curFolder,
    contextBookmarks,
    handleScroll,
    handleSelectedChange,
    onSave,
    onDelete,
  }) => {
    const navigate = useNavigate();
    const resetBookmarkOperation = useBookmarkStore(
      (state) => state.resetBookmarkOperation
    );
    const { operation, url: bmUrl } = useBookmarkStore(
      (state) => state.bookmarkOperation
    );
    const [pos, setPos] = useState(-1);
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [taggedPersons, setTaggedPersons] = useState<string[]>([]);
    const [openDialog, setOpenDialog] = useState(false);

    const resolveBookmark = useCallback(
      async (operation: BOOKMARK_OPERATION, bmUrl: string) => {
        if (operation === BOOKMARK_OPERATION.ADD) {
          const { title = '' } = await getCurrentTab();
          setPos(contextBookmarks.length);
          setUrl(bmUrl);
          setTitle(title);
          setTaggedPersons([]);
          setOpenDialog(true);
          return;
        }
        let bookmark: Required<ContextBookmark> | undefined;
        let pos = -1;
        contextBookmarks.forEach((x, index) => {
          if (x.url === bmUrl) {
            bookmark = x as Required<ContextBookmark>;
            pos = index;
          }
        });
        if (bookmark) {
          setPos(pos);
          setUrl(bookmark.url);
          setTitle(bookmark.title);
          setTaggedPersons(bookmark.taggedPersons);
          setOpenDialog(true);
        }
      },
      [contextBookmarks]
    );

    useEffect(() => {
      if (operation !== BOOKMARK_OPERATION.NONE) {
        resolveBookmark(operation, bmUrl);
      }
    }, [bmUrl, operation, resolveBookmark]);

    const closeDialog = () => {
      //Remove qs before closing and mark current as selected
      if (openDialog) {
        navigate(getBookmarksPanelUrl({ folderContext: curFolder }), {
          replace: true,
        });
      }
      // Reset bookmark fields
      setPos(-1);
      setUrl('');
      setTitle('');
      setTaggedPersons([]);
      setOpenDialog(false);
      resetBookmarkOperation();
      if (operation === BOOKMARK_OPERATION.EDIT) {
        handleScroll(pos);
        handleSelectedChange(pos, true);
      }
    };

    const handleBookmarkDelete = () => {
      onDelete(pos, url);
      closeDialog();
    };

    const handleBookmarkSave = (
      url: string,
      newTitle: string,
      newFolder: string,
      newTaggedPersons: string[]
    ) => {
      onSave(
        url,
        newTitle,
        curFolder,
        newFolder,
        pos,
        taggedPersons,
        newTaggedPersons
      );
      closeDialog();
    };

    return openDialog ? (
      <BookmarkDialog
        isOpen
        url={url}
        origTitle={title}
        origFolder={curFolder}
        origTaggedPersons={taggedPersons}
        headerText={heading[operation]}
        folderList={folderNamesList}
        handleSave={handleBookmarkSave}
        handleDelete={
          operation === BOOKMARK_OPERATION.EDIT
            ? handleBookmarkDelete
            : undefined
        }
        onClose={closeDialog}
        isSaveActive={operation === BOOKMARK_OPERATION.ADD}
      />
    ) : null;
  }
);
EditBookmark.displayName = 'EditBookmark';

export default EditBookmark;
