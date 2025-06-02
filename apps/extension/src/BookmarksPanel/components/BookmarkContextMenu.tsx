import { EBookmarkOperation } from '@bypass/shared';
import { useMantineTheme } from '@mantine/core';
import md5 from 'md5';
import { type PropsWithChildren, memo, useCallback } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { MdOutlineDelete, MdOutlineContentPasteGo } from 'react-icons/md';
import { RxExternalLink } from 'react-icons/rx';
import { TbCut } from 'react-icons/tb';
import { useShallow } from 'zustand/react/shallow';
import { useHotkeys } from '@mantine/hooks';
import useBookmarkStore from '../store/useBookmarkStore';
import { getCutCount, getSelectedCount } from '../utils';
import useBookmarkRouteStore from '@/BookmarksPanel/store/useBookmarkRouteStore';
import ContextMenu, { type IMenuOption } from '@/components/ContextMenu';

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
    const theme = useMantineTheme();
    const selectedCount = getSelectedCount(selectedBookmarks);
    const cutCount = getCutCount(cutBookmarks);

    useHotkeys([
      [
        'mod+x',
        (e) => {
          e.stopPropagation();
          handleCutBookmarks();
        },
      ],
      [
        'mod+v',
        (e) => {
          e.stopPropagation();
          handlePasteSelectedBookmarks();
        },
      ],
    ]);

    const getBookmark = useCallback(
      (id: string) => {
        const selectedIndex = contextBookmarks.findIndex(
          (bookmark) => !bookmark.isDir && md5(bookmark.url ?? '') === id
        );
        const selectedBookmark = contextBookmarks[selectedIndex];
        if (!selectedBookmark || selectedBookmark.isDir) {
          throw new Error(`Bookmark not found for id: ${id}`);
        }
        return {
          pos: selectedIndex,
          url: selectedBookmark.url ?? '',
        };
      },
      [contextBookmarks]
    );

    const handleDeleteOptionClick = useCallback(
      (id: string) => {
        const { pos, url } = getBookmark(id);
        handleUrlRemove(pos, url);
      },
      [getBookmark, handleUrlRemove]
    );

    const handleBookmarkEdit = useCallback(
      (id: string) => {
        const { url } = getBookmark(id);
        setBookmarkOperation(EBookmarkOperation.EDIT, url);
      },
      [getBookmark, setBookmarkOperation]
    );

    const getMenuOptions = () => {
      const menuOptionsList: IMenuOption[] = [
        {
          onClick: handleOpenSelectedBookmarks,
          text: `Open ${
            selectedCount > 1 ? `all (${selectedCount}) ` : ''
          }in new tab`,
          icon: RxExternalLink,
          color: theme.colors.yellow[9],
        },
        {
          onClick: handleCutBookmarks,
          text: 'Cut',
          icon: TbCut,
        },
      ];
      if (cutCount > 0 && selectedCount === 1) {
        menuOptionsList.push({
          onClick: handlePasteSelectedBookmarks,
          text: `Paste (${cutCount})`,
          icon: MdOutlineContentPasteGo,
        });
      }
      if (selectedCount > 1) {
        menuOptionsList.push({
          onClick: handleBulkUrlRemove,
          text: 'Delete All',
          icon: MdOutlineDelete,
          color: theme.colors.red[9],
        });
      } else {
        menuOptionsList.push(
          {
            onClick: handleBookmarkEdit,
            text: 'Edit',
            icon: AiFillEdit,
            color: theme.colors.violet[9],
          },
          {
            onClick: handleDeleteOptionClick,
            text: 'Delete',
            icon: MdOutlineDelete,
            color: theme.colors.red[9],
          }
        );
      }
      return menuOptionsList;
    };

    return (
      <ContextMenu wrapperHeight="initial" options={getMenuOptions()}>
        {children}
      </ContextMenu>
    );
  }
);

export default BookmarkContextMenu;
