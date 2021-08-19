import { Box, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import DriveFileMoveOutlinedIcon from "@material-ui/icons/DriveFileMoveOutlined";
import EditIcon from "@material-ui/icons/Edit";
import OpenInNewTwoToneIcon from "@material-ui/icons/OpenInNewTwoTone";
import ContextMenu from "GlobalComponents/ContextMenu";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import tabs from "GlobalHelpers/chrome/tabs";
import { VoidFunction } from "GlobalInterfaces/custom";
import { MenuOption } from "GlobalInterfaces/menu";
import { Fragment, PureComponent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { compose } from "redux";
import { getBookmarksPanelUrl } from "SrcPath/BookmarksPanel/utils/url";
import { startHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";
import PersonAvatars from "SrcPath/PersonsPanel/components/PersonAvatars";
import { IPersonWithImage } from "SrcPath/PersonsPanel/interfaces/persons";
import {
  getPersonsFromUids,
  getPersonsWithImageUrl,
} from "SrcPath/PersonsPanel/utils";
import withBookmarkRow, { InjectedProps } from "../hoc/withBookmarkRow";
import BookmarkDialog from "./BookmarkDialog";
import BulkBookmarksMoveDialog from "./BulkBookmarksMoveDialog";
import Favicon from "./Favicon";

const titleStyles = { flexGrow: 1, fontSize: "14px" };
const tooltipStyles = { fontSize: "13px" };

export interface Props
  extends RouteComponentProps<any>,
    PropsFromRedux,
    InjectedProps {
  url: string;
  title: string;
  taggedPersons: string[];
  isExternalPage?: boolean;
  folder?: string;
  pos?: number;
  editBookmark?: boolean;
  selectedCount?: number;
  isSelected?: boolean;
  curFolder?: string;
  handleSave?: (
    url: string,
    newTitle: string,
    folder: string,
    newFolder: string,
    pos: number,
    taggedPersons: string[],
    newTaggedPersons: string[]
  ) => void;
  handleRemove?: (pos: number, url: string) => void;
  handleSelectedChange?: (pos: number, isOnlySelection: boolean) => void;
  handleOpenSelectedBookmarks?: VoidFunction;
  handleBulkUrlRemove?: VoidFunction;
  folderNamesList?: string[];
  handleBulkBookmarksMove?: (folder: string) => void;
}

interface State {
  personsWithImageUrls: IPersonWithImage[];
  openEditDialog: boolean;
  openBulkBookmarksMoveDialog: boolean;
  menuOptions: MenuOption[];
}

class Bookmark extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const { editBookmark = false } = props;
    this.state = {
      personsWithImageUrls: [],
      openEditDialog: editBookmark,
      openBulkBookmarksMoveDialog: false,
      menuOptions: this.getMenuOptions(),
    };
  }

  initImageUrl = async () => {
    const { taggedPersons } = this.props;
    const persons = await getPersonsFromUids(taggedPersons);
    const personsWithImageUrls = await getPersonsWithImageUrl(persons);
    this.setState({ personsWithImageUrls });
  };

  componentDidMount() {
    this.initImageUrl();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.selectedCount !== this.props.selectedCount) {
      this.setState({ menuOptions: this.getMenuOptions() });
    }
    if (prevProps.taggedPersons !== this.props.taggedPersons) {
      this.initImageUrl();
    }
  }

  getMenuOptions = (): MenuOption[] => {
    const {
      handleOpenSelectedBookmarks,
      selectedCount = 0,
      handleBulkUrlRemove,
    } = this.props;
    const menuOptionsList = [];
    handleOpenSelectedBookmarks &&
      menuOptionsList.push({
        onClick: handleOpenSelectedBookmarks,
        text: `Open ${
          selectedCount > 1 ? `all (${selectedCount}) ` : ""
        }in new tab`,
        icon: OpenInNewTwoToneIcon,
      });
    if (selectedCount > 1) {
      menuOptionsList.push({
        onClick: this.toggleBulkBookmarksMoveDialog,
        text: "Bulk move bookmarks",
        icon: DriveFileMoveOutlinedIcon,
      });
      handleBulkUrlRemove &&
        menuOptionsList.push({
          onClick: handleBulkUrlRemove,
          text: "Delete All",
          icon: DeleteIcon,
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
    const { folder, editBookmark, history } = this.props;
    const { openEditDialog } = this.state;
    //Remove qs before closing and mark current as selected
    if (editBookmark && openEditDialog) {
      this.handleSelectionChange(null);
      history.replace(getBookmarksPanelUrl({ folder }));
    }
    this.setState({ openEditDialog: !openEditDialog });
  };

  handleBookmarkSave = (
    url: string,
    newTitle: string,
    newFolder: string,
    newTaggedPersons: string[]
  ) => {
    const { folder = "", taggedPersons, pos = 0, handleSave } = this.props;
    handleSave &&
      handleSave(
        url,
        newTitle,
        folder,
        newFolder,
        pos,
        taggedPersons,
        newTaggedPersons
      );
    this.toggleEditDialog();
  };

  handleOpenLink: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey) {
      return;
    }
    const { url, startHistoryMonitor } = this.props;
    startHistoryMonitor();
    tabs.create({ url, selected: false });
  };

  handleDeleteOptionClick = () => {
    const { url, pos = 0, handleRemove } = this.props;
    handleRemove && handleRemove(pos, url);
  };

  handleSelectionChange = (event: React.MouseEvent<HTMLDivElement> | null) => {
    const { isExternalPage } = this.props;
    if (isExternalPage) {
      return;
    }
    const { pos = 0, handleSelectedChange } = this.props;
    const isCtrlPressed = event?.ctrlKey;
    handleSelectedChange && handleSelectedChange(pos, !isCtrlPressed);
  };

  toggleBulkBookmarksMoveDialog = () => {
    const { openBulkBookmarksMoveDialog } = this.state;
    this.setState({
      openBulkBookmarksMoveDialog: !openBulkBookmarksMoveDialog,
    });
  };

  onRightClick = () => {
    const { pos = 0, handleSelectedChange, isSelected } = this.props;
    if (!isSelected && handleSelectedChange) {
      handleSelectedChange(pos, true);
    }
  };

  render() {
    const {
      url,
      title,
      folder = "",
      curFolder = "",
      taggedPersons,
      folderNamesList = [],
      handleBulkBookmarksMove,
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
      <Fragment>
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
              height: "100%",
              ...containerStyles,
            }}
            onDoubleClick={this.handleOpenLink}
            onClick={this.handleSelectionChange}
          >
            <BlackTooltip
              title={<Typography sx={tooltipStyles}>{url}</Typography>}
              arrow
              disableInteractive
              placement="right"
            >
              <Favicon url={url} />
            </BlackTooltip>
            <PersonAvatars persons={personsWithImageUrls} />
            <Typography noWrap sx={titleStyles}>
              {title}
            </Typography>
          </Box>
        </ContextMenu>
        {openEditDialog && (
          <BookmarkDialog
            url={url}
            origTitle={title}
            origFolder={folder}
            origTaggedPersons={taggedPersons}
            headerText="Edit bookmark"
            folderList={folderNamesList}
            handleSave={this.handleBookmarkSave}
            handleDelete={this.handleDeleteOptionClick}
            isOpen={openEditDialog}
            onClose={this.toggleEditDialog}
          />
        )}
        {handleBulkBookmarksMove && openBulkBookmarksMoveDialog && (
          <BulkBookmarksMoveDialog
            origFolder={curFolder}
            folderList={folderNamesList}
            handleSave={handleBulkBookmarksMove}
            isOpen={openBulkBookmarksMoveDialog}
            onClose={this.toggleBulkBookmarksMoveDialog}
          />
        )}
      </Fragment>
    );
  }
}

const mapDispatchToProps = {
  startHistoryMonitor,
};

const connector = connect(null, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const BookmarkExternal = withRouter(compose(connector)(Bookmark));

export { BookmarkExternal };

export default withBookmarkRow(BookmarkExternal);
