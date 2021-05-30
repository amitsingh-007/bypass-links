import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import CollectionsBookmarkTwoToneIcon from "@material-ui/icons/CollectionsBookmarkTwoTone";
import CreateNewFolderTwoToneIcon from "@material-ui/icons/CreateNewFolderTwoTone";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import SyncTwoToneIcon from "@material-ui/icons/SyncTwoTone";
import tabs from "ChromeApi/tabs";
import { displayToast, startHistoryMonitor } from "GlobalActionCreators";
import {
  AccordionHeader,
  PrimaryHeaderContent,
  SecondaryHeaderContent,
} from "GlobalComponents/AccordionHeader";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import { defaultBookmarkFolder } from "GlobalConstants";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { getBookmarksPanelUrl } from "../utils";
import { syncBookmarksFirebaseWithStorage } from "../utils/bookmark";
import { BookmarkDialog, BulkBookmarksMoveDialog } from "./BookmarkDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { FolderDropdown } from "./Dropdown";
import { FolderDialog } from "./FolderDialog";
import SearchInput from "./SearchInput";

class Header extends PureComponent {
  constructor(props) {
    super(props);
    const { showBookmarkDialog, selectedBookmarks } = props;
    this.state = {
      openFolderDialog: false,
      openBookmarkDialog: showBookmarkDialog,
      openBulkBookmarksMoveDialog: false,
      openConfirmationDialog: false,
      isSyncing: false,
      isMoveBookmarksActive: this.isAnyBookmarkSelected(selectedBookmarks),
    };
  }

  componentDidUpdate(prevProps) {
    const { showBookmarkDialog, selectedBookmarks } = this.props;
    if (prevProps.showBookmarkDialog !== showBookmarkDialog) {
      this.setState({ openBookmarkDialog: showBookmarkDialog });
    }
    if (prevProps.selectedBookmarks !== selectedBookmarks) {
      this.setState({
        isMoveBookmarksActive: this.isAnyBookmarkSelected(selectedBookmarks),
      });
    }
  }

  isAnyBookmarkSelected = (selectedBookmarks) =>
    selectedBookmarks.some(Boolean);

  handleClose = () => {
    this.props.history.goBack();
  };

  onFolderChange = (event) => {
    this.props.history.push(
      getBookmarksPanelUrl({ folder: event.target.value })
    );
  };

  handleDiscardButtonClick = (event) => {
    event.stopPropagation();
    const { isSaveButtonActive } = this.props;
    if (isSaveButtonActive) {
      this.setState({ openConfirmationDialog: true });
    } else {
      this.handleClose();
    }
  };

  onSyncClick = async (event) => {
    const { isSyncing } = this.state;
    event.stopPropagation();
    if (isSyncing) {
      return;
    }
    this.setState({ isSyncing: true });
    try {
      await syncBookmarksFirebaseWithStorage();
      this.props.displayToast({ message: "Bookmarks synced succesfully" });
    } catch (ex) {
      this.props.displayToast({ message: ex, severity: "error" });
    }
    this.setState({ isSyncing: false });
  };

  onSaveClick = (event) => {
    event.stopPropagation();
    this.props.handleSave();
  };

  handleOpenSelectedBookmarks = (event) => {
    const { selectedBookmarks, contextBookmarks } = this.props;
    event.stopPropagation();
    this.props.startHistoryMonitor();
    contextBookmarks.forEach(({ url }, index) => {
      if (selectedBookmarks[index]) {
        tabs.create({ url, selected: false });
      }
    });
  };

  onEditBookmarksClick = (event) => {
    event.stopPropagation();
    this.setState({ openBulkBookmarksMoveDialog: true });
  };

  toggleNewFolderDialog = (event) => {
    event && event.stopPropagation();
    const { openFolderDialog } = this.state;
    this.setState({ openFolderDialog: !openFolderDialog });
  };

  toggleBookmarkEditDialog = () => {
    const { history, showBookmarkDialog } = this.props;
    const { openBookmarkDialog } = this.state;
    //Remove qs before closing
    if (showBookmarkDialog && openBookmarkDialog) {
      history.replace(getBookmarksPanelUrl({ folder: defaultBookmarkFolder }));
    }
    this.setState({ openBookmarkDialog: !openBookmarkDialog });
  };

  handleConfirmationDialogClose = () => {
    this.setState({ openConfirmationDialog: false });
  };

  handleConfirmationDialogOk = () => {
    this.handleClose();
    this.setState({ openConfirmationDialog: false });
  };

  handleBulkBookmarksMoveDialogClose = () => {
    this.setState({ openBulkBookmarksMoveDialog: false });
  };

  handleBulkBookmarksMoveSave = (destFolder) => {
    this.props.handleBulkBookmarksMove(destFolder);
  };

  handleNewFolderSave = (folderName) => {
    this.props.handleCreateNewFolder(folderName);
    this.toggleNewFolderDialog();
  };

  handleNewBookmarkSave = (url, title, folder, taggedPersons) => {
    this.props.handleAddNewBookmark(url, title, folder, taggedPersons);
    this.toggleBookmarkEditDialog();
  };

  render() {
    const {
      url,
      title,
      curFolder,
      folderNamesList,
      selectedBookmarks,
      isSaveButtonActive,
      isFetching,
      contextBookmarks,
    } = this.props;
    const {
      openFolderDialog,
      openBookmarkDialog,
      openBulkBookmarksMoveDialog,
      openConfirmationDialog,
      isSyncing,
      isMoveBookmarksActive,
    } = this.state;
    const isOpenSelectedActive = selectedBookmarks.some(
      (isSelected) => isSelected
    );
    return (
      <>
        <AccordionHeader>
          <PrimaryHeaderContent>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                aria-label="Discard"
                component="span"
                style={COLOR.red}
                onClick={this.handleDiscardButtonClick}
                title="Discard and Close"
              >
                <ArrowBackTwoToneIcon fontSize="large" />
              </IconButton>
              <IconButton
                aria-label="Save"
                component="span"
                style={getActiveDisabledColor(isSaveButtonActive, COLOR.green)}
                onClick={this.onSaveClick}
                title="Save locally"
                disabled={!isSaveButtonActive}
              >
                <SaveTwoToneIcon fontSize="large" />
              </IconButton>
              <IconButton
                aria-label="Sync"
                component="span"
                onClick={this.onSyncClick}
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
                onClick={this.toggleNewFolderDialog}
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
                onClick={this.handleOpenSelectedBookmarks}
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
                onClick={this.onEditBookmarksClick}
                title="Move Bookmarks"
                disabled={!isMoveBookmarksActive}
              >
                <CollectionsBookmarkTwoToneIcon fontSize="large" />
              </IconButton>
              {isFetching && (
                <Loader loaderSize={30} padding="12px" disableShrink />
              )}
            </Box>
            <PanelHeading
              heading={`BOOKMARKS PANEL (${contextBookmarks?.length || 0})`}
            />
          </PrimaryHeaderContent>
          <SecondaryHeaderContent>
            <Box sx={{ minWidth: "190px" }}>
              <FolderDropdown
                folder={curFolder}
                folderList={folderNamesList}
                handleFolderChange={this.onFolderChange}
                hideLabel
                fullWidth
              />
            </Box>
            <SearchInput searchClassName="bookmarkRowContainer" />
          </SecondaryHeaderContent>
        </AccordionHeader>
        <FolderDialog
          headerText="Add folder"
          handleSave={this.handleNewFolderSave}
          isOpen={openFolderDialog}
          onClose={this.toggleNewFolderDialog}
        />
        {openBookmarkDialog && (
          <BookmarkDialog
            url={url}
            origTitle={title}
            origFolder={defaultBookmarkFolder}
            headerText="Add bookmark"
            folderList={folderNamesList}
            handleSave={this.handleNewBookmarkSave}
            isOpen={openBookmarkDialog}
            onClose={this.toggleBookmarkEditDialog}
            isSaveActive
          />
        )}
        <ConfirmationDialog
          onClose={this.handleConfirmationDialogClose}
          onOk={this.handleConfirmationDialogOk}
          isOpen={openConfirmationDialog}
        />
        <BulkBookmarksMoveDialog
          origFolder={curFolder}
          folderList={folderNamesList}
          handleSave={this.handleBulkBookmarksMoveSave}
          isOpen={openBulkBookmarksMoveDialog}
          onClose={this.handleBulkBookmarksMoveDialogClose}
        />
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    displayToast: bindActionCreators(displayToast, dispatch),
    startHistoryMonitor: bindActionCreators(startHistoryMonitor, dispatch),
  };
};

const withCompose = compose(withRouter, connect(null, mapDispatchToProps));

export default withCompose(Header);
