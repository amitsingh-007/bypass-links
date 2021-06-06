import { Box, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import DriveFileMoveOutlinedIcon from "@material-ui/icons/DriveFileMoveOutlined";
import EditIcon from "@material-ui/icons/Edit";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import tabs from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/";
import ContextMenu from "GlobalComponents/ContextMenu";
import ProgressiveRender from "GlobalComponents/ProgressiveRender";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import {
  getBookmarksPanelUrl,
  isInInitalView,
} from "SrcPath/BookmarksPanel/utils";
import PersonAvatars from "SrcPath/PersonsPanel/components/PersonAvatars";
import {
  getPersonsFromUids,
  getPersonsWithImageUrl,
} from "SrcPath/PersonsPanel/utils";
import { BOOKMARK_ROW_DIMENTSIONS } from "../constants";
import { BookmarkDialog, BulkBookmarksMoveDialog } from "./BookmarkDialog";
import Favicon from "./Favicon";
import withBookmarkRow from "./withBookmarkRow";

const titleStyles = { flexGrow: "1", fontSize: "14px" };
const tooltipStyles = { fontSize: "13px" };

class Bookmark extends PureComponent {
  constructor(props) {
    super(props);

    const { editBookmark } = props;
    this.state = {
      personsWithImageUrls: "",
      openEditDialog: editBookmark,
      openBulkBookmarksMoveDialog: false,
      menuOptions: this.getMenuOptions(),
    };
  }

  initImageUrl = async () => {
    const { taggedPersons: origTaggedPersons } = this.props;
    const persons = await getPersonsFromUids(origTaggedPersons);
    const personsWithImageUrls = await getPersonsWithImageUrl(persons);
    this.setState({ personsWithImageUrls });
  };

  componentDidMount() {
    this.initImageUrl();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedCount !== this.props.selectedCount) {
      this.setState({ menuOptions: this.getMenuOptions() });
    }
  }

  getMenuOptions = () => {
    const { handleOpenSelectedBookmarks, selectedCount } = this.props;
    const menuOptionsList = [
      {
        onClick: handleOpenSelectedBookmarks,
        text: `Open ${
          selectedCount > 1 ? `all (${selectedCount}) ` : ""
        }in new tab`,
        icon: OpenInNewTwoToneIcon,
      },
    ];
    if (selectedCount > 1) {
      menuOptionsList.push({
        onClick: this.toggleBulkBookmarksMoveDialog,
        text: "Bulk move bookmarks",
        icon: DriveFileMoveOutlinedIcon,
      });
    } else {
      menuOptionsList.push(
        {
          onClick: this.toggleEditDialog,
          text: "Edit",
          icon: EditIcon,
        },
        {
          onClick: this.handleDeleteOptionClick,
          text: "Delete",
          icon: DeleteIcon,
        }
      );
    }
    return menuOptionsList;
  };

  toggleEditDialog = () => {
    const { folder: origFolder, editBookmark, history } = this.props;
    const { openEditDialog } = this.state;
    //Remove qs before closing and mark current as selected
    if (editBookmark && openEditDialog) {
      this.handleSelectionChange(null);
      history.replace(getBookmarksPanelUrl({ folder: origFolder }));
    }
    this.setState({ openEditDialog: !openEditDialog });
  };

  handleBookmarkSave = (url, newTitle, newFolder, newTaggedPersons) => {
    const {
      folder: origFolder,
      taggedPersons: origTaggedPersons,
      pos,
      handleSave,
    } = this.props;
    handleSave(
      url,
      newTitle,
      origFolder,
      newFolder,
      pos,
      origTaggedPersons,
      newTaggedPersons
    );
    this.toggleEditDialog();
  };

  handleOpenLink = (event) => {
    if (event.ctrlKey) {
      return;
    }
    const { url, startHistoryMonitor } = this.props;
    startHistoryMonitor();
    tabs.create({ url, selected: false });
  };

  handleDeleteOptionClick = () => {
    const { url, pos, handleRemove } = this.props;
    handleRemove(pos, url);
  };

  handleSelectionChange = (event) => {
    const { isExternalPage } = this.props;
    if (isExternalPage) {
      return;
    }
    const { pos, handleSelectedChange } = this.props;
    handleSelectedChange(pos, !event?.ctrlKey);
  };

  toggleBulkBookmarksMoveDialog = () => {
    const { openBulkBookmarksMoveDialog } = this.state;
    this.setState({
      openBulkBookmarksMoveDialog: !openBulkBookmarksMoveDialog,
    });
  };

  onRightClick = () => {
    const { pos, handleSelectedChange, isSelected } = this.props;
    if (!isSelected) {
      handleSelectedChange(pos, true);
    }
  };

  render() {
    const {
      url,
      title: origTitle,
      folder: origFolder,
      taggedPersons: origTaggedPersons,
      pos,
      folderNamesList,
      handleBulkBookmarksMove,
      curFolder,
      containerStyles,
      isExternalPage = false,
    } = this.props;
    const {
      personsWithImageUrls,
      openEditDialog,
      openBulkBookmarksMoveDialog,
      menuOptions,
    } = this.state;
    return (
      /**
       * NOTE: Change height when bookmark height changes
       * Force render the bookmark when we want to edit it or its in the initial view
       */
      <ProgressiveRender
        containerStyles={{
          height: `${BOOKMARK_ROW_DIMENTSIONS.height}px`,
          width: "100%",
        }}
        forceRender={openEditDialog || isInInitalView(pos)}
        name={origTitle}
      >
        <ContextMenu
          menuOptions={menuOptions}
          showMenu={!isExternalPage}
          onOpen={this.onRightClick}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              ...containerStyles,
            }}
            onDoubleClick={this.handleOpenLink}
            onClick={this.handleSelectionChange}
          >
            <Favicon url={url} />
            <PersonAvatars persons={personsWithImageUrls} />
            <BlackTooltip
              title={<Typography sx={tooltipStyles}>{url}</Typography>}
              arrow
              disableInteractive
              followCursor
            >
              <Typography noWrap sx={titleStyles}>
                {origTitle}
              </Typography>
            </BlackTooltip>
          </Box>
        </ContextMenu>
        {openEditDialog && (
          <BookmarkDialog
            url={url}
            origTitle={origTitle}
            origFolder={origFolder}
            origTaggedPersons={origTaggedPersons}
            headerText="Edit bookmark"
            folderList={folderNamesList}
            handleSave={this.handleBookmarkSave}
            handleDelete={this.handleDeleteOptionClick}
            isOpen={openEditDialog}
            onClose={this.toggleEditDialog}
          />
        )}
        {openBulkBookmarksMoveDialog && (
          <BulkBookmarksMoveDialog
            origFolder={curFolder}
            folderList={folderNamesList}
            handleSave={handleBulkBookmarksMove}
            isOpen={openBulkBookmarksMoveDialog}
            onClose={this.toggleBulkBookmarksMoveDialog}
          />
        )}
      </ProgressiveRender>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ startHistoryMonitor }, dispatch);

const BookmarkExternal = compose(
  withRouter,
  connect(null, mapDispatchToProps)
)(Bookmark);

export default withBookmarkRow(BookmarkExternal);
export { BookmarkExternal };
