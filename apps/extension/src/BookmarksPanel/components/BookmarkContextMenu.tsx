import ContextMenu, { IMenuOptions } from '@/components/ContextMenu';
import {
  BOOKMARK_OPERATION,
  ContextBookmarks,
  ISelectedBookmarks,
  VoidFunction,
} from '@bypass/shared';
import { useMantineTheme } from '@mantine/core';
import useBookmarkStore from '@store/bookmark';
import md5 from 'md5';
import { memo, useCallback, useMemo } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { HiArrowCircleUp } from 'react-icons/hi';
import { RiBookmark2Fill } from 'react-icons/ri';
import { RxExternalLink } from 'react-icons/rx';

interface Props {
  contextBookmarks: ContextBookmarks;
  children: React.ReactNode;
  selectedBookmarks: ISelectedBookmarks;
  handleOpenSelectedBookmarks: VoidFunction;
  handleBulkUrlRemove: VoidFunction;
  handleUrlRemove: (pos: number, url: string) => void;
  handleMoveBookmarks: (destinationIndex: number) => void;
  handleScroll: (itemNumber: number) => void;
}

const BookmarkContextMenu = memo<Props>(
  ({
    children,
    contextBookmarks,
    selectedBookmarks,
    handleOpenSelectedBookmarks,
    handleUrlRemove,
    handleBulkUrlRemove,
    handleMoveBookmarks,
    handleScroll,
  }) => {
    const theme = useMantineTheme();
    const selectedCount = selectedBookmarks.filter(Boolean).length;

    const setBookmarkOperation = useBookmarkStore(
      (state) => state.setBookmarkOperation
    );

    const getBookmark = useCallback(
      (id: string) => {
        const selectedIndex = contextBookmarks.findIndex(
          (bookmark) => md5(bookmark.url ?? '') === id
        );
        const selectedBookmark = contextBookmarks[selectedIndex];
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
        setBookmarkOperation(BOOKMARK_OPERATION.EDIT, url);
      },
      [getBookmark, setBookmarkOperation]
    );

    const handleMoveToTop = useCallback(() => {
      handleMoveBookmarks(0);
      handleScroll(0);
    }, [handleMoveBookmarks, handleScroll]);

    const menuOptions = useMemo(() => {
      const menuOptionsList: IMenuOptions[] = [
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
          icon: HiArrowCircleUp,
        },
      ];
      if (selectedCount > 1) {
        menuOptionsList.push({
          onClick: handleBulkUrlRemove,
          text: 'Delete All',
          icon: RiBookmark2Fill,
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
            icon: RiBookmark2Fill,
            color: theme.colors.red[9],
          }
        );
      }
      return menuOptionsList;
    }, [
      handleBookmarkEdit,
      handleBulkUrlRemove,
      handleDeleteOptionClick,
      handleMoveToTop,
      handleOpenSelectedBookmarks,
      selectedCount,
      theme.colors,
    ]);

    return (
      <ContextMenu
        options={menuOptions}
        mount={selectedCount > 0}
        adjustOffset={false}
      >
        {children}
      </ContextMenu>
    );
  }
);
BookmarkContextMenu.displayName = 'BookmarkContextMenu';

export default BookmarkContextMenu;
