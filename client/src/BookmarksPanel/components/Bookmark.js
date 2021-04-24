import {
  Box,
  Checkbox,
  makeStyles,
  MenuItem,
  Typography,
} from "@material-ui/core";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/";
import {
  RightClickMenu,
  BlackTooltip,
} from "GlobalComponents/StyledComponents";
import { COLOR } from "GlobalConstants/color";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getBookmarksPanelUrl,
  getFaviconUrl,
} from "SrcPath/BookmarksPanel/utils";
import useMenu from "SrcPath/hooks/useMenu";
import PersonAvatars from "SrcPath/TaggingPanel/components/PersonAvatars";
import {
  getPersonsFromUids,
  getPersonsWithImageUrl,
} from "SrcPath/TaggingPanel/utils";
import { BookmarkDialog } from "./BookmarkDialog";
import withBookmarkRow from "./withBookmarkRow";
import ProgressiveRender from "GlobalComponents/ProgressiveRender";

const titleStyles = { flexGrow: "1" };
const tooltipStyles = { fontSize: "13px" };
const useStyles = makeStyles({
  root: { padding: "unset" },
});

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
    const [imageUrls, setImageUrls] = useState("");
    const [openEditDialog, setOpenEditDialog] = useState(editBookmark);
    const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();

    const initImageUrl = useCallback(async () => {
      const persons = await getPersonsFromUids(origTaggedPersons);
      const personsWithImageUrl = await getPersonsWithImageUrl(persons);
      setImageUrls(personsWithImageUrl.map((person) => person.imageUrl));
    }, [origTaggedPersons]);

    useEffect(() => {
      if (!isExternalPage) {
        initImageUrl();
      }
    }, [initImageUrl, isExternalPage]);

    const toggleEditDialog = useCallback(() => {
      setOpenEditDialog(!openEditDialog);
    }, [openEditDialog]);

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
        //Remove qs before closing
        if (editBookmark && openEditDialog) {
          history.replace(getBookmarksPanelUrl({ folder: origFolder }));
        }
        toggleEditDialog();
      },
      [
        editBookmark,
        handleSave,
        history,
        openEditDialog,
        origFolder,
        origTaggedPersons,
        pos,
        toggleEditDialog,
      ]
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
        { onClick: toggleEditDialog, text: "Edit" },
        { onClick: handleDeleteOptionClick, text: "Delete" },
      ];
      return menuOptionsList.map(({ text, onClick }) => (
        <MenuItem
          key={text}
          onClick={() => {
            onClick();
            onMenuClose();
          }}
        >
          {text}
        </MenuItem>
      ));
    }, [handleDeleteOptionClick, onMenuClose, toggleEditDialog]);

    const checkboxClasses = useStyles();
    return (
      <ProgressiveRender height="34px">
        <Box
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
              classes={{ root: checkboxClasses.root }}
            />
          )}
          <Box
            component="img"
            src={getFaviconUrl(url)}
            sx={{
              width: "20px",
              height: "20px",
              marginLeft: "6px",
              marginRight: "8px",
            }}
          />
          {!isExternalPage && <PersonAvatars imageUrls={imageUrls} />}
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
