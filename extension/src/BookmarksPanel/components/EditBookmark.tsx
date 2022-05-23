import { getCurrentTab } from 'GlobalHelpers/chrome/tabs';
import { RootState } from 'GlobalReducers/rootReducer';
import { memo, useCallback, useEffect, useState } from 'react';
import { resetBookmarkOperation } from '../actionCreators';
import { BOOKMARK_OPERATION } from '../constants';
import { ContextBookmark, ContextBookmarks } from '../interfaces';
import { getBookmarksPanelUrl } from '../utils/url';
import BookmarkDialog from './BookmarkDialog';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
    const dispatch = useDispatch();
    const [pos, setPos] = useState(-1);
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [taggedPersons, setTaggedPersons] = useState<string[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const { operation, url: bmUrl } = useSelector(
      (state: RootState) => state.bookmarkOperation
    );

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
      if (operation === BOOKMARK_OPERATION.EDIT && openDialog) {
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
      dispatch(resetBookmarkOperation());
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
