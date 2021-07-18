import { Box, IconButton, SelectProps } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import CreateNewFolderTwoToneIcon from "@material-ui/icons/CreateNewFolderTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import SyncTwoToneIcon from "@material-ui/icons/SyncTwoTone";
import { displayToast } from "GlobalActionCreators/toast";
import {
  AccordionHeader,
  PrimaryHeaderContent,
  SecondaryHeaderContent,
} from "GlobalComponents/AccordionHeader";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import SearchInput from "GlobalComponents/SearchInput";
import { defaultBookmarkFolder } from "GlobalConstants";
import { COLOR } from "GlobalConstants/color";
import { VoidFunction } from "GlobalInterfaces/custom";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { createRef, PureComponent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { compose } from "redux";
import { ContextBookmarks } from "../interfaces";
import { syncBookmarksFirebaseWithStorage } from "../utils/bookmark";
import { getBookmarksPanelUrl } from "../utils/url";
import BookmarkDialog from "./BookmarkDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { FolderDropdown } from "./Dropdown";
import { FolderDialog } from "./FolderDialog";

interface Props extends RouteComponentProps<any>, PropsFromRedux {
  showBookmarkDialog: boolean;
  isSaveButtonActive: boolean;
  contextBookmarks: ContextBookmarks;
  handleSave: VoidFunction;
  url: string;
  title: string;
  curFolder: string;
  folderNamesList: string[];
  isFetching: boolean;
  handleCreateNewFolder: (folder: string) => void;
  handleAddNewBookmark: (
    url: string,
    title: string,
    folder: string,
    taggedPersons: string[]
  ) => void;
}

interface State {
  openFolderDialog: boolean;
  openBookmarkDialog: boolean;
  openConfirmationDialog: boolean;
  isSyncing: boolean;
}

class Header extends PureComponent<Props, State> {
  private saveButtonRef: React.RefObject<HTMLButtonElement>;

  constructor(props: Props) {
    super(props);
    const { showBookmarkDialog } = props;
    this.state = {
      openFolderDialog: false,
      openBookmarkDialog: showBookmarkDialog,
      openConfirmationDialog: false,
      isSyncing: false,
    };
    this.saveButtonRef = createRef();
  }

  componentDidUpdate(prevProps: Props) {
    const { showBookmarkDialog, isSaveButtonActive, contextBookmarks } =
      this.props;
    if (prevProps.showBookmarkDialog !== showBookmarkDialog) {
      this.setState({ openBookmarkDialog: showBookmarkDialog });
    }
    if (isSaveButtonActive && prevProps.contextBookmarks !== contextBookmarks) {
      //Focus save button after updating bookmarks
      setTimeout(() => {
        this.saveButtonRef?.current?.focus();
      }, 0);
    }
  }

  handleClose = () => {
    this.props.history.goBack();
  };

  onFolderChange: SelectProps<string>["onChange"] = (event) => {
    this.props.history.push(
      getBookmarksPanelUrl({ folder: event.target.value })
    );
  };

  handleDiscardButtonClick: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    const { isSaveButtonActive } = this.props;
    if (isSaveButtonActive) {
      this.setState({ openConfirmationDialog: true });
    } else {
      this.handleClose();
    }
  };

  onSyncClick: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
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

  onSaveClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    this.props.handleSave();
  };

  toggleNewFolderDialog = () => {
    const { openFolderDialog } = this.state;
    this.setState({ openFolderDialog: !openFolderDialog });
  };

  handleNewFolderClick: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    this.toggleNewFolderDialog();
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

  handleNewFolderSave = (folderName: string) => {
    this.props.handleCreateNewFolder(folderName);
    this.toggleNewFolderDialog();
  };

  handleNewBookmarkSave = (
    url: string,
    title: string,
    folder: string,
    taggedPersons: string[]
  ) => {
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                pl: "6px",
                "> *": { mr: "12px !important" },
              }}
            >
              <IconButton
                size="small"
                aria-label="Discard"
                component="span"
                style={COLOR.red}
                onClick={this.handleDiscardButtonClick}
                title="Discard and Close"
              >
                <ArrowBackTwoToneIcon fontSize="large" />
              </IconButton>
              <IconButton
                size="small"
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
                size="small"
                aria-label="Sync"
                component="span"
                onClick={this.onSyncClick}
                title="Sync storage to firebase"
                disabled={isSyncing}
              >
                <SyncTwoToneIcon
                  fontSize="large"
                  className={isSyncing ? "iconLoading" : ""}
                  htmlColor={COLOR.orange.color}
                />
              </IconButton>
              <IconButton
                size="small"
                aria-label="NewFolder"
                component="span"
                style={COLOR.blue}
                onClick={this.toggleNewFolderDialog}
                title="Add new folder"
              >
                <CreateNewFolderTwoToneIcon fontSize="large" />
              </IconButton>
              {isFetching && (
                <Loader
                  loaderSize={28}
                  disableShrink
                  styles={{ padding: "3px" }}
                />
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

const mapDispatchToProps = {
  displayToast,
};

const connector = connect(null, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const withCompose = compose(connector);

export default withRouter(withCompose(Header));
