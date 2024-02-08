import ContextMenu, { IMenuOption } from '@/components/ContextMenu';
import {
  ContextBookmarks,
  EBookmarkOperation,
  ISelectedBookmarks,
} from '@bypass/shared';
import { useMantineTheme } from '@mantine/core';
import useBookmarkStore from '@store/bookmark';
import md5 from 'md5';
import { PropsWithChildren, memo, useCallback } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { BsArrowUp } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { RxExternalLink } from 'react-icons/rx';
import { getSelectedCount } from '../utils';

type Props = PropsWithChildren<{
  contextBookmarks: ContextBookmarks;
  children: React.ReactNode;
  selectedBookmarks: ISelectedBookmarks;
  handleOpenSelectedBookmarks: VoidFunction;
  handleBulkUrlRemove: VoidFunction;
  handleUrlRemove: (pos: number, url: string) => void;
  handleMoveBookmarks: (destinationIndex: number) => void;
  handleScroll: (itemNumber: number) => void;
}>;

const BookmarkContextMenu = memo<Props>(function BookmarkContextMenu({
  children,
  contextBookmarks,
  selectedBookmarks,
  handleOpenSelectedBookmarks,
  handleUrlRemove,
  handleBulkUrlRemove,
  handleMoveBookmarks,
  handleScroll,
}) {
  const theme = useMantineTheme();
  const selectedCount = getSelectedCount(selectedBookmarks);
  const setBookmarkOperation = useBookmarkStore(
    (state) => state.setBookmarkOperation
  );

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

  const handleMoveToTop = useCallback(() => {
    handleMoveBookmarks(0);
    handleScroll(0);
  }, [handleMoveBookmarks, handleScroll]);

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
        onClick: handleMoveToTop,
        text: 'Top',
        icon: BsArrowUp,
      },
    ];
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
});

export default BookmarkContextMenu;
