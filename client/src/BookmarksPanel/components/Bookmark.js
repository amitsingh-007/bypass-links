import { Box, Checkbox, makeStyles, Typography } from "@material-ui/core";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import { COLOR } from "GlobalConstants/color";
import { memo, useState } from "react";
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
const useStyles = makeStyles({
  root: { padding: "unset" },
});

const Bookmark = memo(
  ({
    url,
    title: origTitle,
    folder: origFolder,
    pos,
    isSelected,
    folderNamesList,
    handleSave,
    handleRemove,
    handleSelectedChange,
    renderMenu,
    editBookmark,
    containerStyles,
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
    const handleSelectionChange = () => {
      handleSelectedChange(pos);
    };

    const checkboxClasses = useStyles();
    return (
      <>
        <Box
          onDoubleClick={handleOpenLink}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            ...containerStyles,
          }}
        >
          <Checkbox
            checked={isSelected}
            onChange={handleSelectionChange}
            style={COLOR.pink}
            disableRipple
            classes={{ root: checkboxClasses.root }}
          />
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
          <BlackTooltip
            title={<Typography style={tooltipStyles}>{url}</Typography>}
            arrow
            disableInteractive
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
          handleDelete={handleDeleteOptionClick}
          isOpen={openEditDialog}
          onClose={toggleEditDialog}
        />
      </>
    );
  }
);

export default withBookmarkRow(Bookmark);
