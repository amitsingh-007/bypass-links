import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import CreateNewFolderTwoToneIcon from "@material-ui/icons/CreateNewFolderTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import PanelHeading from "GlobalComponents/PanelHeading";
import { COLOR } from "GlobalConstants/color";
import { defaultBookmarkFolder } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo, useState } from "react";
import { useHistory } from "react-router-dom";
import { getBookmarksPanelUrl } from "../utils";
import ConfirmationDialog from "./ConfirmationDialog";
import { BookmarkDialog, FolderDialog } from "./FormComponents";

const Header = memo(
  ({
    addBookmark,
    url,
    title,
    folderNamesList,
    handleClose,
    handleSave,
    handleCreateNewFolder,
    handleAddNewBookmark,
    isSaveButtonActive,
  }) => {
    const history = useHistory();
    const [openFolderDialog, setOpenFolderDialog] = useState(false);
    const [openBookmarkDialog, setOpenBookmarkDialog] = useState(addBookmark);
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

    const handleDiscardButtonClick = () => {
      if (isSaveButtonActive) {
        setOpenConfirmationDialog(true);
      } else {
        handleClose();
      }
    };

    const toggleNewFolderDialog = () => {
      setOpenFolderDialog(!openFolderDialog);
    };
    const toggleBookmarkEditDialog = () => {
      //Remove qs before closing
      if (addBookmark && openBookmarkDialog) {
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

    return (
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
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
