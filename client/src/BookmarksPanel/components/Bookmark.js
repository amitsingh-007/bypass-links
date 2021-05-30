import { Box, Checkbox, MenuItem, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/";
import ProgressiveRender from "GlobalComponents/ProgressiveRender";
import {
  BlackTooltip,
  RightClickMenu,
} from "GlobalComponents/StyledComponents";
import { COLOR } from "GlobalConstants/color";
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

const titleStyles = { flexGrow: "1" };
const tooltipStyles = { fontSize: "13px" };

const Bookmark = memo(
  ({
    url,
    title: origTitle,
    folder: origFolder,
    taggedPersons: origTaggedPersons,
    pos,
    isSelected,
    folderNamesList,
    handleSave,
    handleRemove,
    handleSelectedChange,
    editBookmark,
    containerStyles,
    //Tells whether it is being rendered on page other than BookmarksPanel
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

    const handleOpenLink = useCallback(() => {
      dispatch(startHistoryMonitor());
      tabs.create({ url, selected: false });
    }, [dispatch, url]);

    const handleDeleteOptionClick = useCallback(() => {
      handleRemove(pos, url);
    }, [handleRemove, pos, url]);

    const handleSelectionChange = useCallback(() => {
      handleSelectedChange(pos);
    }, [handleSelectedChange, pos]);

    const renderRightMenu = useCallback(() => {
      const menuOptionsList = [
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
    }, [handleDeleteOptionClick, onMenuClose, toggleEditDialog]);

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
          onContextMenu={onMenuOpen}
        >
          {!isExternalPage && (
            <Checkbox
              checked={isSelected}
              onChange={handleSelectionChange}
              style={COLOR.pink}
              disableRipple
              sx={{ padding: "0px" }}
            />
          )}
          <Favicon url={url} />
          {!isExternalPage && <PersonAvatars persons={personWithimageUrls} />}
          <BlackTooltip
            title={<Typography style={tooltipStyles}>{url}</Typography>}
            arrow
            disableInteractive
            followCursor
          >
            <Typography noWrap style={titleStyles}>
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
