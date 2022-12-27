import { BOOKMARK_OPERATION } from '@bypass/shared/components/Bookmarks/constants';
import {
  ContextBookmarks,
  ISelectedBookmarks,
} from '@bypass/shared/components/Bookmarks/interfaces';
import { VoidFunction } from '@bypass/shared/interfaces/custom';
import ContextMenu from '@components/ContextMenu';
import { IMenuOptions } from '@interfaces/menu';
import useBookmarkStore from '@store/bookmark';
import md5 from 'md5';
import { memo } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { FiExternalLink } from 'react-icons/fi';
import { HiArrowCircleDown, HiArrowCircleUp } from 'react-icons/hi';
import { RiBookmark2Fill } from 'react-icons/ri';

const BookmarkContextMenu = memo<{
  contextBookmarks: ContextBookmarks;
  children: React.ReactNode;
  selectedBookmarks: ISelectedBookmarks;
  handleOpenSelectedBookmarks: VoidFunction;
  handleBulkUrlRemove: VoidFunction;
  handleUrlRemove: (pos: number, url: string) => void;
  handleMoveBookmarks: (destinationIndex: number) => void;
  handleScroll: (itemNumber: number) => void;
}>(
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
    const selectedCount = selectedBookmarks.filter(Boolean).length;

    const setBookmarkOperation = useBookmarkStore(
      (state) => state.setBookmarkOperation
    );

    const getBookmark = (id: string) => {
      const selectedIndex = contextBookmarks.findIndex(
        (bookmark) => md5(bookmark.url ?? '') === id
      );
      const selectedBookmark = contextBookmarks[selectedIndex];
      return {
        pos: selectedIndex,
        url: selectedBookmark.url ?? '',
      };
    };

    const handleDeleteOptionClick = (id: string) => {
      const { pos, url } = getBookmark(id);
      handleUrlRemove(pos, url);
    };

    const handleBookmarkEdit = (id: string) => {
      const { url } = getBookmark(id);
      setBookmarkOperation(BOOKMARK_OPERATION.EDIT, url);
    };

    const handleMoveToTopBottom = (pos: number) => () => {
      handleMoveBookmarks(pos);
      handleScroll(pos);
    };

    const getMenuOptions = (): IMenuOptions => {
      const menuOptionsList = [];
      menuOptionsList.push({
        onClick: handleOpenSelectedBookmarks,
        text: `Open ${
          selectedCount > 1 ? `all (${selectedCount}) ` : ''
        }in new tab`,
        icon: FiExternalLink,
      });
      menuOptionsList.push([
        {
          onClick: handleMoveToTopBottom(0),
          text: 'Top',
          icon: HiArrowCircleUp,
        },
        {
          onClick: handleMoveToTopBottom(contextBookmarks.length - 1),
          text: 'Bottom',
          icon: HiArrowCircleDown,
        },
      ]);
      if (selectedCount > 1) {
        menuOptionsList.push({
          onClick: handleBulkUrlRemove,
          text: 'Delete All',
          icon: RiBookmark2Fill,
        });
      } else {
        menuOptionsList.push(
          {
            onClick: handleBookmarkEdit,
            text: 'Edit',
            icon: AiFillEdit,
          },
          {
            onClick: handleDeleteOptionClick,
            text: 'Delete',
            icon: RiBookmark2Fill,
          }
        );
      }
      return menuOptionsList;
    };

    return (
      <ContextMenu
        showMenu={selectedCount > 0}
        getMenuOptions={getMenuOptions}
        containerStyles={{ flex: 1 }}
      >
        {children}
      </ContextMenu>
    );
  }
);
BookmarkContextMenu.displayName = 'BookmarkContextMenu';

export default BookmarkContextMenu;
