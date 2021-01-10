import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import CreateNewFolderTwoToneIcon from "@material-ui/icons/CreateNewFolderTwoTone";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/index";
import PanelHeading from "GlobalComponents/PanelHeading";
import { COLOR } from "GlobalConstants/color";
import { defaultBookmarkFolder } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { getBookmarksPanelUrl } from "../utils";
import ConfirmationDialog from "./ConfirmationDialog";
import { BookmarkDialog, FolderDialog, FolderDropdown } from "./FormComponents";

const Header = memo(
  ({
    showBookmarkDialog,
    url,
    title,
    curFolder,
    folderNamesList,
    selectedBookmarks,
    contextBookmarks,
    handleClose,
    handleSave,
    handleCreateNewFolder,
    handleAddNewBookmark,
    isSaveButtonActive,
  }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [openFolderDialog, setOpenFolderDialog] = useState(false);
    const [openBookmarkDialog, setOpenBookmarkDialog] = useState(
      showBookmarkDialog
    );
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

    useEffect(() => {
      setOpenBookmarkDialog(showBookmarkDialog);
    }, [showBookmarkDialog]);

    const onFolderChange = (event) => {
      history.push(getBookmarksPanelUrl({ folder: event.target.value }));
    };

    const handleDiscardButtonClick = () => {
      if (isSaveButtonActive) {
        setOpenConfirmationDialog(true);
      } else {
        handleClose();
      }
    };

    const handleOpenSelectedBookmarks = () => {
      dispatch(startHistoryMonitor());
      contextBookmarks.forEach(({ url }, index) => {
        if (selectedBookmarks[index]) {
          tabs.create({ url, selected: false });
        }
      });
    };
    const toggleNewFolderDialog = () => {
      setOpenFolderDialog(!openFolderDialog);
    };
    const toggleBookmarkEditDialog = () => {
      //Remove qs before closing
      if (showBookmarkDialog && openBookmarkDialog) {
        history.replace(
          getBookmarksPanelUrl({ folder: defaultBookmarkFolder })
        );
      }
      setOpenBookmarkDialog(!openBookmarkDialog);
    };
    const handleConfirmationDialogClose = () => {
      setOpenConfirmationDialog(false);
    };
    const handleConfirmationDialogOk = () => {
      handleClose();
      setOpenConfirmationDialog(false);
    };

    const handleNewFolderSave = (folderName) => {
      handleCreateNewFolder(folderName);
      toggleNewFolderDialog();
    };
    const handleNewBookmarkSave = (url, title, folder) => {
      handleAddNewBookmark(url, title, folder);
      toggleBookmarkEditDialog();
    };

    const isOpenSelectedActive = selectedBookmarks.some(
      (isSelected) => isSelected
    );
    return (
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="Discard"
              component="span"
              style={COLOR.red}
              onClick={handleDiscardButtonClick}
              title="Discard and Close"
            >
              <ArrowBackTwoToneIcon fontSize="large" />
            </IconButton>
            <IconButton
              aria-label="Save"
              component="span"
              style={getActiveDisabledColor(isSaveButtonActive, COLOR.green)}
              onClick={handleSave}
              title="Save and Close"
              disabled={!isSaveButtonActive}
            >
              <SaveTwoToneIcon fontSize="large" />
            </IconButton>
            <IconButton
              aria-label="NewFolder"
              component="span"
              style={COLOR.blue}
              onClick={toggleNewFolderDialog}
              title="Add new folder"
            >
              <CreateNewFolderTwoToneIcon fontSize="large" />
            </IconButton>
            <IconButton
              aria-label="OpenSelected"
              component="span"
              style={getActiveDisabledColor(
                isOpenSelectedActive,
                COLOR.deepPurple
              )}
              disabled={!isOpenSelectedActive}
              onClick={handleOpenSelectedBookmarks}
              title="Open Selected"
            >
              <OpenInNewTwoToneIcon fontSize="large" />
            </IconButton>
            <Box sx={{ marginLeft: "10px" }}>
              <FolderDropdown
                folder={curFolder}
                folderList={folderNamesList}
                handleFolderChange={onFolderChange}
                variant="outlined"
                hideLabel
              />
            </Box>
          </Box>
          <PanelHeading heading="BOOKMARKS PANEL" />
        </Box>
        <FolderDialog
          headerText="Add folder"
          handleSave={handleNewFolderSave}
          isOpen={openFolderDialog}
          onClose={toggleNewFolderDialog}
        />
        <BookmarkDialog
          url={url}
          origTitle={title}
          origFolder={defaultBookmarkFolder}
          headerText="Add bookmark"
          folderList={folderNamesList}
          handleSave={handleNewBookmarkSave}
          isOpen={openBookmarkDialog}
          onClose={toggleBookmarkEditDialog}
          isSaveActive
        />
        <ConfirmationDialog
          onClose={handleConfirmationDialogClose}
          onOk={handleConfirmationDialogOk}
          isOpen={openConfirmationDialog}
        />
      </>
    );
  }
);

export default Header;
