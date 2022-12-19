import ContextMenu from 'GlobalComponents/ContextMenu';
import { VoidFunction } from '@bypass/common/interfaces/custom';
import { IMenuOptions } from 'GlobalInterfaces/menu';
import md5 from 'md5';
import { memo, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { BsFillFolderSymlinkFill } from 'react-icons/bs';
import { FiExternalLink } from 'react-icons/fi';
import { HiArrowCircleDown, HiArrowCircleUp } from 'react-icons/hi';
import { RiBookmark2Fill } from 'react-icons/ri';
import { BOOKMARK_PANEL_CONTENT_HEIGHT } from '../constants';
import { BOOKMARK_OPERATION } from '@bypass/common/components/Bookmarks/constants';
import {
  ContextBookmarks,
  ISelectedBookmarks,
} from '@bypass/common/components/Bookmarks/interfaces';
import BulkBookmarksMoveDialog from './BulkBookmarksMoveDialog';
import useBookmarkStore from 'GlobalStore/bookmark';

const BookmarkContextMenu = memo<{
  curFolder: string;
  contextBookmarks: ContextBookmarks;
  folderNamesList: string[];
  children: React.ReactNode;
  selectedBookmarks: ISelectedBookmarks;
  handleOpenSelectedBookmarks: VoidFunction;
  handleBulkUrlRemove: VoidFunction;
  handleUrlRemove: (pos: number, url: string) => void;
  handleBulkBookmarksMove: (folder: string) => void;
  handleMoveBookmarks: (destinationIndex: number) => void;
  handleScroll: (itemNumber: number) => void;
}>(
  ({
    children,
    curFolder,
    contextBookmarks,
    folderNamesList,
    selectedBookmarks,
    handleOpenSelectedBookmarks,
    handleBulkBookmarksMove,
    handleUrlRemove,
    handleBulkUrlRemove,
    handleMoveBookmarks,
    handleScroll,
  }) => {
    const selectedCount = selectedBookmarks.filter(Boolean).length;

    const setBookmarkOperation = useBookmarkStore(
      (state) => state.setBookmarkOperation
    );
    const [openBulkMoveDialog, setOpenBulkMoveDialog] = useState(false);

    const toggleBulkMoveDialog = () => {
      setOpenBulkMoveDialog(!openBulkMoveDialog);
    };

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
          onClick: toggleBulkMoveDialog,
          text: 'Bulk move bookmarks',
          icon: BsFillFolderSymlinkFill,
        });
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
      <>
        <ContextMenu
          showMenu={selectedCount > 0}
          getMenuOptions={getMenuOptions}
          containerStyles={{ height: `${BOOKMARK_PANEL_CONTENT_HEIGHT}px` }}
        >
          {children}
        </ContextMenu>
        {openBulkMoveDialog && (
          <BulkBookmarksMoveDialog
            isOpen
            origFolder={curFolder}
            folderList={folderNamesList}
            handleSave={handleBulkBookmarksMove}
            onClose={toggleBulkMoveDialog}
          />
        )}
      </>
    );
  }
);
BookmarkContextMenu.displayName = 'BookmarkContextMenu';

export default BookmarkContextMenu;
