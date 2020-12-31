import { Box, Typography } from "@material-ui/core";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import React, { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getBookmarksPanelUrl,
  getFaviconUrl,
} from "SrcPath/BookmarksPanel/utils";
import { BookmarkDialog } from "./FormComponents";
import withBookmarkRow from "./withBookmarkRow";

const titleStyles = { flexGrow: "1" };
const tooltipStyles = { fontSize: "13px" };

const Bookmark = memo(
  ({
    url,
    title: origTitle,
    folder: origFolder,
    pos,
    folderNamesList,
    handleSave,
    handleRemove,
    renderMenu,
    editBookmark,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [openEditDialog, setOpenEditDialog] = useState(editBookmark);

    const toggleEditDialog = () => {
      setOpenEditDialog(!openEditDialog);
    };

    const handleBookmarkSave = (url, newTitle, newFolder) => {
      handleSave(url, newTitle, origFolder, newFolder, pos);
      //Remove qs before closing
      if (editBookmark && openEditDialog) {
        history.replace(getBookmarksPanelUrl({ folder: origFolder }));
      }
      toggleEditDialog();
    };
    const handleOpenLink = () => {
      dispatch(startHistoryMonitor());
      tabs.create({ url, selected: false });
    };
    const handleDeleteOptionClick = () => {
      handleRemove(pos, url);
    };

    return (
      <>
        <Box display="flex" width="100%" onDoubleClick={handleOpenLink}>
          <Box
            component="img"
            width="20px"
            height="20px"
            marginRight="8px"
            src={getFaviconUrl(url)}
          />
          <BlackTooltip
            title={<Typography style={tooltipStyles}>{url}</Typography>}
            arrow
          >
            <Typography noWrap style={titleStyles}>
              {origTitle}
            </Typography>
          </BlackTooltip>
        </Box>
        {renderMenu([
          { onClick: handleOpenLink, text: "Open in new tab" },
          { onClick: toggleEditDialog, text: "Edit" },
          { onClick: handleDeleteOptionClick, text: "Delete" },
        ])}
        <BookmarkDialog
          url={url}
          origTitle={origTitle}
          origFolder={origFolder}
          headerText="Edit bookmark"
          folderList={folderNamesList}
          handleSave={handleBookmarkSave}
          isOpen={openEditDialog}
          onClose={toggleEditDialog}
        />
      </>
    );
  }
);

export default withBookmarkRow(Bookmark);
