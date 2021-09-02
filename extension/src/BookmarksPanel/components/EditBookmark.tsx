import { defaultBookmarkFolder } from "GlobalConstants";
import { getCurrentTab } from "GlobalHelpers/chrome/tabs";
import { RootState } from "GlobalReducers/rootReducer";
import { PureComponent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { compose } from "redux";
import { resetBookmarkOperation } from "../actionCreators";
import { BOOKMARK_OPERATION } from "../constants";
import { ContextBookmark, ContextBookmarks } from "../interfaces";
import { getBookmarksPanelUrl } from "../utils/url";
import BookmarkDialog from "./BookmarkDialog";

const heading = {
  [BOOKMARK_OPERATION.NONE]: "",
  [BOOKMARK_OPERATION.ADD]: "Add bookmark",
  [BOOKMARK_OPERATION.EDIT]: "Edit bookmark",
};

interface Props extends RouteComponentProps<any>, PropsFromRedux {
  folderNamesList: string[];
  curFolder: string;
  contextBookmarks: ContextBookmarks;
  handleScroll: (pos: number) => void;
  handleSelectedChange: (pos: number, isOnlySelection: boolean) => void;
  onSave: (
    url: string,
    newTitle: string,
    folder: string,
    newFolder: string,
    pos: number,
    taggedPersons: string[],
    newTaggedPersons: string[]
  ) => void;
  onDelete: (pos: number, url: string) => void;
}

interface State {
  pos: number;
  url: string;
  title: string;
  taggedPersons: string[];
  folder: string;
  openDialog: boolean;
}

const defaultBookmarkFields = {
  pos: -1,
  url: "",
  title: "",
  folder: "",
  taggedPersons: [],
};

class EditBookmark extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...defaultBookmarkFields,
      openDialog: false,
    };
  }

  resolveBookmark = async (operation: BOOKMARK_OPERATION, bmUrl: string) => {
    const { contextBookmarks, curFolder } = this.props;
    if (operation === BOOKMARK_OPERATION.ADD) {
      const { title = "" } = await getCurrentTab();
      this.setState({
        pos: contextBookmarks.length,
        folder: defaultBookmarkFolder,
        taggedPersons: [],
        url: bmUrl,
        title,
        openDialog: true,
      });
      return;
    }
    let bookmark: Required<ContextBookmark> | undefined;
    let pos = -1;
    contextBookmarks.forEach((x, index) => {
      if (x.url === bmUrl) {
        bookmark = x as Required<ContextBookmark>;
        pos = index;
      }
    });
    if (bookmark) {
      this.setState({
        pos,
        url: bookmark.url,
        title: bookmark.title,
        taggedPersons: bookmark.taggedPersons,
        folder: curFolder,
        openDialog: true,
      });
    }
  };

  componentDidUpdate(prevProps: Props) {
    const { operation, bmUrl } = this.props;
    if (
      prevProps.operation !== operation &&
      operation !== BOOKMARK_OPERATION.NONE
    ) {
      this.resolveBookmark(operation, bmUrl);
    }
  }

  closeDialog = () => {
    const { pos, openDialog } = this.state;
    const {
      curFolder,
      operation,
      history,
      resetBookmarkOperation,
      handleScroll,
      handleSelectedChange,
    } = this.props;
    //Remove qs before closing and mark current as selected
    if (operation === BOOKMARK_OPERATION.EDIT && openDialog) {
      history.replace(getBookmarksPanelUrl({ folderContext: curFolder }));
    }
    this.setState({ ...defaultBookmarkFields, openDialog: false });
    resetBookmarkOperation();
    if (operation === BOOKMARK_OPERATION.EDIT) {
      handleScroll(pos);
      handleSelectedChange(pos, true);
    }
  };

  handleBookmarkDelete = () => {
    const { onDelete } = this.props;
    const { pos, url } = this.state;
    onDelete(pos, url);
    this.closeDialog();
  };

  handleBookmarkSave = (
    url: string,
    newTitle: string,
    newFolder: string,
    newTaggedPersons: string[]
  ) => {
    const { taggedPersons, pos } = this.state;
    const { curFolder, onSave } = this.props;
    onSave(
      url,
      newTitle,
      curFolder,
      newFolder,
      pos,
      taggedPersons,
      newTaggedPersons
    );
    this.closeDialog();
  };

  render() {
    const { openDialog, url, title, taggedPersons } = this.state;
    const { curFolder, operation, folderNamesList } = this.props;

    if (!openDialog) {
      return null;
    }
    return (
      <BookmarkDialog
        isOpen
        url={url}
        origTitle={title}
        origFolder={curFolder}
        origTaggedPersons={taggedPersons}
        headerText={heading[operation]}
        folderList={folderNamesList}
        handleSave={this.handleBookmarkSave}
        handleDelete={
          operation === BOOKMARK_OPERATION.EDIT
            ? this.handleBookmarkDelete
            : undefined
        }
        onClose={this.closeDialog}
        isSaveActive={operation === BOOKMARK_OPERATION.ADD}
      />
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { operation, url: bmUrl } = state.bookmarkOperation;
  return { operation, bmUrl };
};

const mapDispatchToProps = {
  resetBookmarkOperation,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
const withCompose = compose(connector);

export default withRouter(withCompose(EditBookmark));
