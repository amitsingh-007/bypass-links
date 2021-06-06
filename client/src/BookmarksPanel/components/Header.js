import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import CreateNewFolderTwoToneIcon from "@material-ui/icons/CreateNewFolderTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import SyncTwoToneIcon from "@material-ui/icons/SyncTwoTone";
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
import { createRef } from "react";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { getBookmarksPanelUrl } from "../utils";
import { syncBookmarksFirebaseWithStorage } from "../utils/bookmark";
import { BookmarkDialog } from "./BookmarkDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { FolderDropdown } from "./Dropdown";
import { FolderDialog } from "./FolderDialog";
import SearchInput from "./SearchInput";

class Header extends PureComponent {
  constructor(props) {
    super(props);
    const { showBookmarkDialog } = props;
    this.state = {
      openFolderDialog: false,
      openBookmarkDialog: showBookmarkDialog,
      openConfirmationDialog: false,
      isSyncing: false,
    };
    this.saveButtonRef = createRef(null);
  }

  componentDidUpdate(prevProps) {
    const { showBookmarkDialog } = this.props;
    if (prevProps.showBookmarkDialog !== showBookmarkDialog) {
      this.setState({ openBookmarkDialog: showBookmarkDialog });
    }
    if (
      this.props.isSaveButtonActive &&
      prevProps.contextBookmarks !== this.props.contextBookmarks
    ) {
      //Focus save button after updating bookmarks
      setTimeout(() => {
        this.saveButtonRef?.current?.focus();
      }, 0);
    }
  }

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
      isSaveButtonActive,
      isFetching,
      contextBookmarks,
    } = this.props;
    const {
      openFolderDialog,
      openBookmarkDialog,
      openConfirmationDialog,
      isSyncing,
    } = this.state;
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
                ref={this.saveButtonRef}
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
