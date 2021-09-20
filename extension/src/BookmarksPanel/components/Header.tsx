import { Box, Button, SelectProps } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { displayToast } from "GlobalActionCreators/toast";
import {
  AccordionHeader,
  PrimaryHeaderContent,
  SecondaryHeaderContent,
} from "GlobalComponents/AccordionHeader";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import Search from "GlobalComponents/Search";
import { VoidFunction } from "GlobalInterfaces/custom";
import React, { createRef, PureComponent } from "react";
import { FaFolderPlus } from "react-icons/fa";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { IoSave } from "react-icons/io5";
import { RiUploadCloud2Fill } from "react-icons/ri";
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
    } catch (ex: any) {
      console.error("Bookmarks sync failed", ex);
      this.props.displayToast({
        message: "Bookmarks sync failed",
        severity: "error",
      });
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
              <Button
                variant="outlined"
                startIcon={<HiOutlineArrowNarrowLeft />}
                onClick={this.handleDiscardButtonClick}
                size="small"
                color="error"
              >
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<FaFolderPlus />}
                onClick={this.handleNewFolderClick}
                size="small"
                color="primary"
              >
                Add
              </Button>
              <Button
                variant="outlined"
                disabled={!isSaveButtonActive}
                startIcon={<IoSave />}
                onClick={this.onSaveClick}
                size="small"
                color="success"
                ref={this.saveButtonRef}
              >
                Save
              </Button>
              <LoadingButton
                variant="outlined"
                startIcon={<RiUploadCloud2Fill />}
                onClick={this.onSyncClick}
                size="small"
                color="warning"
                loading={isSyncing}
              >
                Sync
              </LoadingButton>
              {isFetching && <Loader />}
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
