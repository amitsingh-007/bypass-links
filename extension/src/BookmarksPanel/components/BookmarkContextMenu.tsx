import DeleteIcon from "@material-ui/icons/Delete";
import DriveFileMoveOutlinedIcon from "@material-ui/icons/DriveFileMoveOutlined";
import EditIcon from "@material-ui/icons/Edit";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import ContextMenu from "GlobalComponents/ContextMenu";
import { VoidFunction } from "GlobalInterfaces/custom";
import { MenuOption } from "GlobalInterfaces/menu";
import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { setBookmarkOperation } from "../actionCreators";
import {
  BOOKMARK_OPERATION,
  BOOKMARK_PANEL_CONTENT_HEIGHT,
} from "../constants";
import { ContextBookmarks, ISelectedBookmarks } from "../interfaces";
import BulkBookmarksMoveDialog from "./BulkBookmarksMoveDialog";

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
  }) => {
    const dispatch = useDispatch();
    const [openBulkMoveDialog, setOpenBulkMoveDialog] = useState(false);

    const selectedCount = selectedBookmarks.filter(Boolean).length;

    const toggleBulkMoveDialog = () => {
      setOpenBulkMoveDialog(!openBulkMoveDialog);
    };

    const getBookmark = () => {
      const selectedIndex = selectedBookmarks.findIndex(Boolean);
      const selectedBookmark = contextBookmarks[selectedIndex];
      return {
        pos: selectedIndex,
        url: selectedBookmark.url ?? "",
      };
    };

    const handleDeleteOptionClick = () => {
      const { pos, url } = getBookmark();
      handleUrlRemove(pos, url);
    };

    const handleBookmarkEdit = () => {
      const { url } = getBookmark();
      dispatch(setBookmarkOperation(BOOKMARK_OPERATION.EDIT, url));
    };

    const getMenuOptions = (): MenuOption[] => {
      const menuOptionsList = [];
      menuOptionsList.push({
        onClick: handleOpenSelectedBookmarks,
        text: `Open ${
          selectedCount > 1 ? `all (${selectedCount}) ` : ""
        }in new tab`,
        icon: OpenInNewTwoToneIcon,
      });
      if (selectedCount > 1) {
        menuOptionsList.push({
          onClick: toggleBulkMoveDialog,
          text: "Bulk move bookmarks",
          icon: DriveFileMoveOutlinedIcon,
        });
        menuOptionsList.push({
          onClick: handleBulkUrlRemove,
          text: "Delete All",
          icon: DeleteIcon,
        });
      } else {
        menuOptionsList.push(
          {
            onClick: handleBookmarkEdit,
            text: "Edit",
            icon: EditIcon,
          },
          {
            onClick: handleDeleteOptionClick,
            text: "Delete",
            icon: DeleteIcon,
          }
        );
      }
      return menuOptionsList;
    };

    return (
      <>
        <ContextMenu
          menuOptions={getMenuOptions()}
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
BookmarkContextMenu.displayName = "BookmarkContextMenu";

export default BookmarkContextMenu;
