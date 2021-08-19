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
import Search from "GlobalComponents/Search";
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
import ConfirmationDialog from "./ConfirmationDialog";
import { FolderDropdown } from "./Dropdown";
import { FolderDialog } from "./FolderDialog";

interface Props extends RouteComponentProps<any>, PropsFromRedux {
  isSaveButtonActive: boolean;
  contextBookmarks: ContextBookmarks;
  handleSave: VoidFunction;
  curFolder: string;
  folderNamesList: string[];
  isFetching: boolean;
  handleCreateNewFolder: (folder: string) => void;
  onSearchChange: (text: string) => void;
}

interface State {
  openFolderDialog: boolean;
  openConfirmationDialog: boolean;
  isSyncing: boolean;
}

class Header extends PureComponent<Props, State> {
  private saveButtonRef: React.RefObject<HTMLButtonElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      openFolderDialog: false,
      openConfirmationDialog: false,
      isSyncing: false,
    };
    this.saveButtonRef = createRef();
  }

  componentDidUpdate(prevProps: Props) {
    const { isSaveButtonActive, contextBookmarks } = this.props;
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
      getBookmarksPanelUrl({ folderContext: event.target.value })
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

  render() {
    const {
      curFolder,
      folderNamesList,
      isSaveButtonActive,
      isFetching,
      contextBookmarks,
      onSearchChange,
    } = this.props;
    const { openFolderDialog, openConfirmationDialog, isSyncing } = this.state;
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
                component="span"
                style={COLOR.red}
                onClick={this.handleDiscardButtonClick}
                title="Discard and Close"
              >
                <ArrowBackTwoToneIcon fontSize="large" />
              </IconButton>
              <IconButton
                size="small"
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
                component="span"
                style={COLOR.blue}
                onClick={this.handleNewFolderClick}
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
            <Search onChange={onSearchChange} />
          </SecondaryHeaderContent>
        </AccordionHeader>
        <FolderDialog
          headerText="Add folder"
          handleSave={this.handleNewFolderSave}
          isOpen={openFolderDialog}
          onClose={this.toggleNewFolderDialog}
        />
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
