import { Box, MenuItem, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/";
import ProgressiveRender from "GlobalComponents/ProgressiveRender";
import {
  BlackTooltip,
  RightClickMenu,
} from "GlobalComponents/StyledComponents";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getBookmarksPanelUrl,
  isInInitalView,
} from "SrcPath/BookmarksPanel/utils";
import useMenu from "SrcPath/hooks/useMenu";
import PersonAvatars from "SrcPath/PersonsPanel/components/PersonAvatars";
import {
  getPersonsFromUids,
  getPersonsWithImageUrl,
} from "SrcPath/PersonsPanel/utils";
import { BOOKMARK_ROW_DIMENTSIONS } from "../constants";
import { BookmarkDialog } from "./BookmarkDialog";
import Favicon from "./Favicon";
import withBookmarkRow from "./withBookmarkRow";

const titleStyles = { flexGrow: "1", fontSize: "14px" };
const tooltipStyles = { fontSize: "13px" };

const Bookmark = memo(
  ({
    url,
    title: origTitle,
    folder: origFolder,
    taggedPersons: origTaggedPersons,
    pos,
    folderNamesList,
    handleSave,
    handleRemove,
    handleSelectedChange,
    handleOpenSelectedBookmarks,
    isSelected,
    selectedCount,
    editBookmark,
    containerStyles,
    isExternalPage = false,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const bookmarkRef = useRef(null);
    const [personWithimageUrls, setPersonWithimageUrls] = useState("");
    const [openEditDialog, setOpenEditDialog] = useState(editBookmark);
    const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();

    const initImageUrl = useCallback(async () => {
      const persons = await getPersonsFromUids(origTaggedPersons);
      const personsWithImageUrl = await getPersonsWithImageUrl(persons);
      setPersonWithimageUrls(personsWithImageUrl);
    }, [origTaggedPersons]);

    useEffect(() => {
      if (!isExternalPage) {
        initImageUrl();
      }
    }, [initImageUrl, isExternalPage]);

    const animateOpenedBookmark = () => {
      if (bookmarkRef?.current) {
        bookmarkRef.current.style.animation = "blink-bookmark 0.5s infinite";
        setTimeout(() => {
          bookmarkRef.current.style.animation = "";
        }, 3 * 1000);
      }
    };

    const toggleEditDialog = useCallback(() => {
      //Remove qs before closing
      if (editBookmark && openEditDialog) {
        //Blink for 3s after close of bookmark dialog
        animateOpenedBookmark();
        history.replace(getBookmarksPanelUrl({ folder: origFolder }));
      }
      setOpenEditDialog(!openEditDialog);
    }, [editBookmark, history, openEditDialog, origFolder]);

    const handleBookmarkSave = useCallback(
      (url, newTitle, newFolder, newTaggedPersons) => {
        handleSave(
          url,
          newTitle,
          origFolder,
          newFolder,
          pos,
          origTaggedPersons,
          newTaggedPersons
        );
        toggleEditDialog();
      },
      [handleSave, origFolder, origTaggedPersons, pos, toggleEditDialog]
    );

    const handleOpenLink = useCallback(
      (event) => {
        if (event.ctrlKey) {
          return;
        }
        dispatch(startHistoryMonitor());
        tabs.create({ url, selected: false });
      },
      [dispatch, url]
    );

    const handleDeleteOptionClick = useCallback(() => {
      handleRemove(pos, url);
    }, [handleRemove, pos, url]);

    const handleSelectionChange = useCallback(
      (event) => {
        handleSelectedChange(pos, !event.ctrlKey);
      },
      [handleSelectedChange, pos]
    );

    const handleRightClick = (event) => {
      if (!isSelected) {
        handleSelectedChange(pos, true);
      }
      onMenuOpen(event);
    };

    const renderRightMenu = useCallback(() => {
      const menuOptionsList = [
        {
          onClick: handleOpenSelectedBookmarks,
          text: `Open ${
            selectedCount > 1 ? `all (${selectedCount}) ` : ""
          }in new tab`,
          icon: OpenInNewTwoToneIcon,
        },
        { onClick: toggleEditDialog, text: "Edit", icon: EditIcon },
        { onClick: handleDeleteOptionClick, text: "Delete", icon: DeleteIcon },
      ];
      return menuOptionsList.map(({ text, icon: Icon, onClick }) => (
        <MenuItem
          key={text}
          onClick={() => {
            onClick();
            onMenuClose();
          }}
        >
          <Icon sx={{ marginRight: "12px" }} />
          {text}
        </MenuItem>
      ));
    }, [
      handleDeleteOptionClick,
      handleOpenSelectedBookmarks,
      onMenuClose,
      selectedCount,
      toggleEditDialog,
    ]);

    return (
      /**
       * NOTE: Change height when bookmark height changes
       * Force render the bookmark when we want to edit it or its in the initial view
       */
      <ProgressiveRender
        containerStyles={{
          height: `${BOOKMARK_ROW_DIMENTSIONS.height}px`,
          width: "100%",
        }}
        forceRender={openEditDialog || isInInitalView(pos)}
        name={origTitle}
      >
        <Box
          ref={bookmarkRef}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            ...containerStyles,
          }}
          onDoubleClick={handleOpenLink}
          onContextMenu={handleRightClick}
          onClick={handleSelectionChange}
        >
          <Favicon url={url} />
          {!isExternalPage && <PersonAvatars persons={personWithimageUrls} />}
          <BlackTooltip
            title={<Typography sx={tooltipStyles}>{url}</Typography>}
            arrow
            disableInteractive
            followCursor
          >
            <Typography noWrap sx={titleStyles}>
              {origTitle}
            </Typography>
          </BlackTooltip>
        </Box>
        {!isExternalPage && (
          <RightClickMenu
            open={isMenuOpen}
            onClose={onMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={menuPos}
          >
            {renderRightMenu()}
          </RightClickMenu>
        )}
        {openEditDialog && (
          <BookmarkDialog
            url={url}
            origTitle={origTitle}
            origFolder={origFolder}
            origTaggedPersons={origTaggedPersons}
            headerText="Edit bookmark"
            folderList={folderNamesList}
            handleSave={handleBookmarkSave}
            handleDelete={handleDeleteOptionClick}
            isOpen={openEditDialog}
            onClose={toggleEditDialog}
          />
        )}
      </ProgressiveRender>
    );
  }
);

export default withBookmarkRow(Bookmark);

export { Bookmark as BookmarkExternal };
