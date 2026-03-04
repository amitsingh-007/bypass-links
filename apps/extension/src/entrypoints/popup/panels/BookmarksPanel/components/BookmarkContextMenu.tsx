import { EBookmarkOperation } from '@bypass/shared';
import {
  BookEditIcon,
  BookmarkRemove01Icon,
  FileExportIcon,
  FilePasteIcon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons';
import { useHotkeys } from '@mantine/hooks';
import { memo, useCallback, type PropsWithChildren } from 'react';
import { useShallow } from 'zustand/react/shallow';
import ContextMenu, { type IMenuOption } from '@popup/components/ContextMenu';
import useBookmarkStore from '../store/useBookmarkStore';
import useBookmarkRouteStore from '../store/useBookmarkRouteStore';
import { getCutCount, getSelectedCount } from '../utils';
import { findBookmarkById } from '../utils/bookmark';

type Props = PropsWithChildren<{
  children: React.ReactNode;
  handleOpenSelectedBookmarks: VoidFunction;
}>;

const BookmarkContextMenu = memo<Props>(
  ({ children, handleOpenSelectedBookmarks }) => {
    const setBookmarkOperation = useBookmarkRouteStore(
      (state) => state.setBookmarkOperation
    );
    const {
      contextBookmarks,
      selectedBookmarks,
      cutBookmarks,
      handleUrlRemove,
      handleBulkUrlRemove,
      handleCutBookmarks,
      handlePasteSelectedBookmarks,
    } = useBookmarkStore(
      useShallow((state) => ({
        contextBookmarks: state.contextBookmarks,
        selectedBookmarks: state.selectedBookmarks,
        cutBookmarks: state.cutBookmarks,
        handleUrlRemove: state.handleUrlRemove,
        handleBulkUrlRemove: state.handleBulkUrlRemove,
        handleCutBookmarks: state.handleCutBookmarks,
        handlePasteSelectedBookmarks: state.handlePasteSelectedBookmarks,
      }))
    );
    const selectedCount = getSelectedCount(selectedBookmarks);
    const cutCount = getCutCount(cutBookmarks);

    // Keyboard shortcuts using ahooks useKeyPress
    useHotkeys([
      [
        'mod+X',
        (e) => {
          e.stopPropagation();
          handleCutBookmarks();
        },
      ],
      [
        'mod+V',
        (e) => {
          e.stopPropagation();
          handlePasteSelectedBookmarks();
        },
      ],
    ]);

    const getBookmark = useCallback(
      (id: string) => {
        const bookmark = findBookmarkById(contextBookmarks, id);
        if (!bookmark) {
          throw new Error(`Bookmark not found for id: ${id}`);
        }
        return bookmark;
      },
      [contextBookmarks]
    );

    const handleDeleteOptionClick = useCallback(
      (id: string) => {
        handleUrlRemove(id);
      },
      [handleUrlRemove]
    );

    const handleBookmarkEdit = useCallback(
      (id: string) => {
        const bookmark = getBookmark(id);
        setBookmarkOperation(EBookmarkOperation.EDIT, bookmark.url);
      },
      [getBookmark, setBookmarkOperation]
    );

    const getMenuOptions = (): IMenuOption[] => {
      const menuOptionsList: IMenuOption[] = [
        {
          onClick: handleOpenSelectedBookmarks,
          text: `Open ${
            selectedCount > 1 ? `all (${selectedCount}) ` : ''
          }in new tab`,
          id: 'open',
          icon: LinkSquare02Icon,
        },
        {
          onClick: handleCutBookmarks,
          text: 'Cut',
          icon: FileExportIcon,
          id: 'cut',
        },
      ];
      if (cutCount > 0 && selectedCount === 1) {
        menuOptionsList.push({
          onClick: handlePasteSelectedBookmarks,
          text: `Paste (${cutCount})`,
          id: 'paste',
          icon: FilePasteIcon,
        });
      }
      if (selectedCount > 1) {
        menuOptionsList.push({
          onClick: handleBulkUrlRemove,
          text: 'Delete All',
          id: 'delete-all',
          icon: BookmarkRemove01Icon,
          variant: 'destructive',
        });
      } else {
        menuOptionsList.push(
          {
            onClick: handleBookmarkEdit,
            text: 'Edit',
            id: 'edit',
            icon: BookEditIcon,
          },
          {
            onClick: handleDeleteOptionClick,
            text: 'Delete',
            id: 'delete',
            icon: BookmarkRemove01Icon,
            variant: 'destructive',
          }
        );
      }
      return menuOptionsList;
    };

    return <ContextMenu options={getMenuOptions()}>{children}</ContextMenu>;
  }
);

export default BookmarkContextMenu;
