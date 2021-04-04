import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import CollectionsBookmarkTwoToneIcon from "@material-ui/icons/CollectionsBookmarkTwoTone";
import CreateNewFolderTwoToneIcon from "@material-ui/icons/CreateNewFolderTwoTone";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import SyncTwoToneIcon from "@material-ui/icons/SyncTwoTone";
import tabs from "ChromeApi/tabs";
import { displayToast, startHistoryMonitor } from "GlobalActionCreators/index";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import { BG_COLOR_DARK, COLOR } from "GlobalConstants/color";
import { defaultBookmarkFolder } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { DEFAULT_PERSON_UID } from "SrcPath/TaggingPanel/constants";
import { getBookmarksPanelUrl } from "../utils";
import { syncBookmarksFirebaseWithStorage } from "../utils/bookmark";
import ConfirmationDialog from "./ConfirmationDialog";
import {
  BookmarkDialog,
  BulkBookmarksMoveDialog,
  FolderDialog,
  FolderDropdown,
} from "./FormComponents";
import SearchInput from "./SearchInput";

const useAccordionStyles = makeStyles({
  root: { margin: "0px !important", backgroundColor: BG_COLOR_DARK },
});
const useAccordionSummaryStyles = makeStyles({
  root: { padding: "0px" },
  content: { margin: "0px !important" },
});
const useAccordionDetailsStyles = makeStyles({
  root: { paddingTop: "0px" },
});

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
    handleBulkBookmarksMove,
    isSaveButtonActive,
    isFetching,
  }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [openFolderDialog, setOpenFolderDialog] = useState(false);
    const [openBookmarkDialog, setOpenBookmarkDialog] = useState(
      showBookmarkDialog
    );
    const [
      openBulkBookmarksMoveDialog,
      setOpenBulkBookmarksMoveDialog,
    ] = useState(false);
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isMoveBookmarksActive, setIsMoveBookmarksActive] = useState(false);

    useEffect(() => {
      setOpenBookmarkDialog(showBookmarkDialog);
    }, [showBookmarkDialog]);

    useEffect(() => {
      const isAnyBookmarkSelected = selectedBookmarks.some(Boolean);
      setIsMoveBookmarksActive(isAnyBookmarkSelected);
    }, [selectedBookmarks]);

    const onFolderChange = (event) => {
      history.push(getBookmarksPanelUrl({ folder: event.target.value }));
    };

    const handleSearch = (searchText = "") => {
      const lowerSearchText = searchText.toLowerCase();
      //search both url and title
      document.querySelectorAll(".bookmarkRowContainer").forEach((node) => {
        const textsToSearch = [
          node.getAttribute("data-text")?.toLowerCase(),
          node.getAttribute("data-subtext")?.toLowerCase(),
        ];
        if (
          textsToSearch.some((text) => text && text.includes(lowerSearchText))
        ) {
          node.style.display = "";
        } else {
          node.style.display = "none";
        }
      });
    };

    const handleDiscardButtonClick = (event) => {
      event.stopPropagation();
      if (isSaveButtonActive) {
        setOpenConfirmationDialog(true);
      } else {
        handleClose();
      }
    };

    const onSyncClick = async (event) => {
      event.stopPropagation();
      if (isSyncing) {
        return;
      }
      setIsSyncing(true);
      try {
        await syncBookmarksFirebaseWithStorage();
        dispatch(displayToast({ message: "Bookmarks synced succesfully" }));
      } catch (ex) {
        dispatch(displayToast({ message: ex, severity: "error" }));
      }
      setIsSyncing(false);
    };
    const onSaveClick = (event) => {
      event.stopPropagation();
      handleSave();
    };
    const handleOpenSelectedBookmarks = (event) => {
      event.stopPropagation();
      dispatch(startHistoryMonitor());
      contextBookmarks.forEach(({ url }, index) => {
        if (selectedBookmarks[index]) {
          tabs.create({ url, selected: false });
        }
      });
    };
    const onEditBookmarksClick = (event) => {
      event.stopPropagation();
      setOpenBulkBookmarksMoveDialog(true);
    };
    const toggleNewFolderDialog = (event) => {
      event && event.stopPropagation();
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
    const handleBulkBookmarksMoveDialogClose = () => {
      setOpenBulkBookmarksMoveDialog(false);
    };
    const handleBulkBookmarksMoveSave = (destFolder) => {
      handleBulkBookmarksMove(destFolder);
    };

    const handleNewFolderSave = (folderName) => {
      handleCreateNewFolder(folderName);
      toggleNewFolderDialog();
    };
    const handleNewBookmarkSave = (url, title, folder, personUid) => {
      handleAddNewBookmark(url, title, folder, personUid);
      toggleBookmarkEditDialog();
    };

    const accordionStyles = useAccordionStyles();
    const accordionSummaryStyles = useAccordionSummaryStyles();
    const accordionDetailsStyles = useAccordionDetailsStyles();
    const isOpenSelectedActive = selectedBookmarks.some(
      (isSelected) => isSelected
    );
    return (
      <>
        <Accordion classes={{ root: accordionStyles.root }}>
          <AccordionSummary
            classes={{
              root: accordionSummaryStyles.root,
              content: accordionSummaryStyles.content,
              expanded: accordionSummaryStyles.expanded,
            }}
            expandIcon={<ExpandMoreIcon />}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
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
                  style={getActiveDisabledColor(
                    isSaveButtonActive,
                    COLOR.green
                  )}
                  onClick={onSaveClick}
                  title="Save locally"
                  disabled={!isSaveButtonActive}
                >
                  <SaveTwoToneIcon fontSize="large" />
                </IconButton>
                <IconButton
                  aria-label="Sync"
                  component="span"
                  onClick={onSyncClick}
                  title="Sync storage to firebase"
                  disabled={isSyncing}
                >
                  <SyncTwoToneIcon
                    fontSize="large"
                    className={isSyncing ? "iconLoading" : null}
                    htmlColor={COLOR.orange.color}
                  />
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
                <IconButton
                  aria-label="Move Bookmarks"
                  component="span"
                  style={getActiveDisabledColor(
                    isMoveBookmarksActive,
                    COLOR.brown
                  )}
                  onClick={onEditBookmarksClick}
                  title="Move Bookmarks"
                  disabled={!isMoveBookmarksActive}
                >
                  <CollectionsBookmarkTwoToneIcon fontSize="large" />
                </IconButton>
                {isFetching && (
                  <Loader loaderSize={30} padding="12px" disableShrink />
                )}
              </Box>
              <PanelHeading heading="BOOKMARKS PANEL" />
            </Box>
          </AccordionSummary>
          <AccordionDetails classes={{ root: accordionDetailsStyles.root }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <FolderDropdown
                  folder={curFolder}
                  folderList={folderNamesList}
                  handleFolderChange={onFolderChange}
                  variant="outlined"
                  hideLabel
                />
              </Box>
              <SearchInput onUserInput={handleSearch} />
            </Box>
          </AccordionDetails>
        </Accordion>
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
          origPersonUid={DEFAULT_PERSON_UID}
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
        <BulkBookmarksMoveDialog
          origFolder={curFolder}
          folderList={folderNamesList}
          handleSave={handleBulkBookmarksMoveSave}
          isOpen={openBulkBookmarksMoveDialog}
          onClose={handleBulkBookmarksMoveDialogClose}
        />
      </>
    );
  }
);

export default Header;
