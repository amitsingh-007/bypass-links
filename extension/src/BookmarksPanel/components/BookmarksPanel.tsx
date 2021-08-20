import { Box, GlobalStyles } from "@material-ui/core";
import { displayToast } from "GlobalActionCreators/toast";
import { STORAGE_KEYS } from "GlobalConstants";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { PANEL_DIMENSIONS } from "GlobalConstants/styles";
import storage from "GlobalHelpers/chrome/storage";
import tabs from "GlobalHelpers/chrome/tabs";
import { getBookmarks } from "GlobalHelpers/fetchFromStorage";
import { addToCache } from "GlobalUtils/cache";
import md5 from "md5";
import { createRef, PureComponent } from "react";
import {
  DragDropContext,
  DragDropContextProps,
  Droppable,
} from "react-beautiful-dnd";
import { connect, ConnectedProps } from "react-redux";
import { FixedSizeList as List } from "react-window";
import { startHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";
import { updateTaggedPersonUrls } from "SrcPath/PersonsPanel/actionCreators";
import { IUpdateTaggedPerson } from "SrcPath/PersonsPanel/interfaces/persons";
import { setBookmarkOperation } from "../actionCreators";
import {
  BOOKMARK_OPERATION,
  BOOKMARK_PANEL_CONTENT_HEIGHT,
  BOOKMARK_ROW_DIMENTSIONS,
} from "../constants";
import {
  ContextBookmarks,
  IBookmarksObj,
  ISelectedBookmarks,
} from "../interfaces";
import { BMPanelQueryParams } from "../interfaces/url";
import { bookmarksMapper } from "../mapper";
import {
  getAllFolderNames,
  getFaviconUrl,
  getFilteredContextBookmarks,
  getSelectedCount,
  isFolderContainsDir,
  shouldRenderBookmarks,
} from "../utils";
import {
  getBookmarksAfterDrag,
  getDestinationIndex,
  getSelectedBookmarksAfterDrag,
} from "../utils/manipulate";
import DragClone from "./DragClone";
import EditBookmark from "./EditBookmark";
import Header from "./Header";
import { ScrollUpButton } from "./ScrollButton";
import VirtualRow, { VirtualRowProps } from "./VirtualRow";

const bookmarksContainerId = "bookmarks-wrapper";

interface Props extends PropsFromRedux, BMPanelQueryParams {}

interface State {
  contextBookmarks: ContextBookmarks;
  urlList: IBookmarksObj["urlList"];
  folderList: IBookmarksObj["folderList"];
  folders: IBookmarksObj["folders"];
  selectedBookmarks: ISelectedBookmarks;
  isFetching: boolean;
  isSaveButtonActive: boolean;
  updateTaggedPersons: IUpdateTaggedPerson[];
  searchText: string;
}

class BookmarksPanel extends PureComponent<Props, State> {
  private listRef: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    this.state = {
      contextBookmarks: [],
      urlList: {},
      folderList: {},
      folders: {},
      selectedBookmarks: [],
      isFetching: true,
      isSaveButtonActive: false,
      updateTaggedPersons: [],
      searchText: "",
    };
    this.listRef = createRef();
  }

  initBookmarksData = async () => {
    const { folderContext } = this.props;
    this.setState({ isSaveButtonActive: false, isFetching: true });
    const { folders, urlList, folderList } = await getBookmarks();
    const folderContextHash = md5(folderContext);
    const modifiedBookmarks = Object.entries(folders[folderContextHash]).map(
      (kvp) => bookmarksMapper(kvp, urlList, folderList)
    );
    this.setState({
      contextBookmarks: modifiedBookmarks,
      urlList,
      folderList,
      folders,
      selectedBookmarks: [],
      isFetching: false,
    });
  };

  componentDidMount() {
    this.initBookmarksData().then(() => {
      const { operation, bmUrl, setBookmarkOperation } = this.props;
      if (operation !== BOOKMARK_OPERATION.NONE) {
        /**
         * Need to call after initBookmarksData,
         * Since EditBookmark internally needs contextBookmarks to be set beforehand
         */
        setBookmarkOperation(operation, bmUrl);
      }
    });
    document
      .getElementById(bookmarksContainerId)
      ?.addEventListener("keydown", this.handleKeyPress);
  }

  componentDidUpdate(prevProps: Props) {
    const { folderContext } = this.props;
    if (prevProps.folderContext !== folderContext) {
      this.initBookmarksData();
    }
  }

  componentWillUnmount() {
    document
      .getElementById(bookmarksContainerId)
      ?.removeEventListener("keydown", this.handleKeyPress);
  }

  handleSearchTextChange = (text: string) => {
    this.setState({ searchText: text });
  };

  handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.resetSelectedBookmarks();
    }
    if (event.key === "Enter") {
      this.handleOpenSelectedBookmarks();
    }
  };

  handleOpenSelectedBookmarks = () => {
    const { selectedBookmarks, contextBookmarks } = this.state;
    this.props.startHistoryMonitor();
    contextBookmarks.forEach(({ url }, index) => {
      if (selectedBookmarks[index]) {
        tabs.create({ url, selected: false });
      }
    });
  };

  updatePersonUrls = (
    prevTaggedPersons: string[] = [],
    newTaggedPersons: string[] = [],
    urlHash: string
  ) => {
    const { updateTaggedPersons } = this.state;
    this.setState({
      updateTaggedPersons: [
        ...updateTaggedPersons,
        {
          prevTaggedPersons,
          newTaggedPersons,
          urlHash,
        },
      ],
    });
  };

  handleSelectedChange = (pos: number, isOnlySelection: boolean) => {
    const { selectedBookmarks } = this.state;
    if (isOnlySelection) {
      selectedBookmarks.fill(false);
    }
    selectedBookmarks[pos] = !selectedBookmarks[pos];
    this.setState({ selectedBookmarks: [...selectedBookmarks] });
  };

  resetSelectedBookmarks = () => {
    this.setState({ selectedBookmarks: [] });
  };

  handleCreateNewFolder = (name: string) => {
    const { contextBookmarks, folderList } = this.state;
    const { folderContext } = this.props;
    const isDir = true;
    const nameHash = md5(name);
    //Update current context folder
    contextBookmarks?.unshift({ isDir, name });
    //Update data in all folders list
    folderList[nameHash] = {
      name: btoa(name),
      parentHash: md5(folderContext),
    };
    this.setState({
      contextBookmarks: [...contextBookmarks],
      folderList: { ...folderList },
      isSaveButtonActive: true,
    });
    this.handleScroll(0);
  };

  handleBookmarkSave = (
    url: string,
    title: string,
    oldFolder: string,
    newFolder: string,
    pos: number,
    prevTaggedPersons: string[],
    newTaggedPersons: string[]
  ) => {
    const { contextBookmarks, folders, urlList } = this.state;
    const isFolderChange = oldFolder !== newFolder;
    const isDir = false;
    const urlHash = md5(url);
    const newFolderHash = md5(newFolder);
    //Update url in tagged persons
    this.updatePersonUrls(prevTaggedPersons, newTaggedPersons, urlHash);
    //Update urlList with new values
    urlList[urlHash] = {
      url: btoa(encodeURIComponent(url)),
      title: btoa(encodeURIComponent(title)),
      taggedPersons: [...newTaggedPersons],
      parentHash: newFolderHash,
    };
    //Update folders and current context folder content based on dir change
    const newBookmarks = contextBookmarks;
    if (isFolderChange) {
      folders[newFolderHash] = folders[newFolderHash] || []; //to handle empty folders
      folders[newFolderHash].push({ isDir, hash: urlHash });
      this.setState({ folders: { ...folders } });
      newBookmarks.splice(pos, 1);
    } else {
      newBookmarks[pos] = {
        url,
        title,
        taggedPersons: newTaggedPersons,
        isDir,
      };
    }
    //Add bookmark favicon in the cache
    addToCache(CACHE_BUCKET_KEYS.favicon, getFaviconUrl(url));

    this.setState({
      urlList: { ...urlList },
      contextBookmarks: [...newBookmarks],
      isSaveButtonActive: true,
    });
  };

  handleBulkBookmarksMove = (destFolder: string) => {
    const { contextBookmarks, selectedBookmarks, folders, urlList } =
      this.state;
    const bookmarksToMove = contextBookmarks
      .filter((bookmark, index) =>
        Boolean(selectedBookmarks[index] && bookmark.url)
      )
      .map(({ url = "" }) => md5(url));
    //Change parent folder hash in urlList
    const destFolderHash = md5(destFolder);
    bookmarksToMove.forEach(
      (urlHash) =>
        (urlList[urlHash] = {
          ...urlList[urlHash],
          parentHash: destFolderHash,
        })
    );
    //Add to destination folder
    folders[destFolderHash] = (folders[destFolderHash] || []).concat(
      bookmarksToMove.map((urlHash) => ({ isDir: false, hash: urlHash }))
    );
    //Remove from old folder, ie, contextBookmarks
    const updatedBookmarksInOldFolder = contextBookmarks.filter(
      (_bookmark, index) => !selectedBookmarks[index]
    );
    this.setState({
      urlList: { ...urlList },
      folders: { ...folders },
      contextBookmarks: updatedBookmarksInOldFolder,
      selectedBookmarks: [],
      isSaveButtonActive: true,
    });
  };

  handleUrlRemove = (pos: number, url: string) => {
    const { contextBookmarks, urlList } = this.state;
    const urlHash = md5(url);
    //Update url in tagged persons
    this.updatePersonUrls(contextBookmarks[pos].taggedPersons, [], urlHash);
    //Remove from current context folder
    contextBookmarks.splice(pos, 1);
    //Remove from all urls list
    const newUrlList = { ...urlList };
    delete newUrlList[urlHash];
    this.setState({
      contextBookmarks: [...contextBookmarks],
      urlList: newUrlList,
      isSaveButtonActive: true,
      selectedBookmarks: [],
    });
  };

  handleBulkUrlRemove = () => {
    const { contextBookmarks, urlList, selectedBookmarks } = this.state;
    const newUrlList = { ...urlList };
    const taggedPersonData: IUpdateTaggedPerson[] = [];
    //Remove from current context folder
    const filteredContextBookmarks = contextBookmarks.filter(
      (bookmark, index) => {
        if (selectedBookmarks[index]) {
          const urlHash = md5(bookmark.url || "");
          //Update url in tagged persons
          taggedPersonData.push({
            prevTaggedPersons: bookmark.taggedPersons || [],
            newTaggedPersons: [],
            urlHash,
          });
          //Remove from all urls list
          delete newUrlList[urlHash];
          return false;
        }
        return true;
      }
    );
    this.setState({
      contextBookmarks: filteredContextBookmarks,
      updateTaggedPersons: taggedPersonData,
      urlList: newUrlList,
      isSaveButtonActive: true,
      selectedBookmarks: [],
    });
  };

  handleFolderEdit = (oldName: string, newName: string, pos: number) => {
    const { contextBookmarks, folderList, folders, urlList } = this.state;
    const oldFolderHash = md5(oldName);
    const newFolderHash = md5(newName);
    //Update parentHash in urlList
    const newUrlList = Object.entries(urlList).reduce<IBookmarksObj["urlList"]>(
      (obj, [hash, data]) => {
        if (data.parentHash === oldFolderHash) {
          obj[hash] = { ...data, parentHash: newFolderHash };
        } else {
          obj[hash] = data;
        }
        return obj;
      },
      {}
    );
    //Update name in folderList
    folderList[newFolderHash] = {
      ...folderList[oldFolderHash],
      name: btoa(newName),
    };
    delete folderList[oldFolderHash];
    //Update in folders
    folders[newFolderHash] = folders[oldFolderHash];
    delete folders[oldFolderHash];
    //Update current folder
    contextBookmarks[pos] = { ...contextBookmarks[pos], name: newName };
    this.setState({
      urlList: newUrlList,
      folderList: { ...folderList },
      folders: { ...folders },
      contextBookmarks: [...contextBookmarks],
      isSaveButtonActive: true,
    });
  };

  handleFolderRemove = (pos: number, name: string) => {
    const {
      urlList,
      folderList,
      contextBookmarks,
      folders,
      updateTaggedPersons,
    } = this.state;
    const folderHash = md5(name);
    if (isFolderContainsDir(folders, folderHash)) {
      this.props.displayToast({
        message: "Remove inner folders first.",
        severity: "error",
      });
      return;
    }
    //Remove from current context folder
    contextBookmarks.splice(pos, 1);
    //Remove from all folders list
    delete folderList[folderHash];
    //Remove all urls inside the folder and update all urls in tagged persons
    const taggedPersonData: IUpdateTaggedPerson[] = [];
    const newUrlList = Object.entries(urlList).reduce<IBookmarksObj["urlList"]>(
      (obj, [hash, data]) => {
        if (data.parentHash !== folderHash) {
          obj[hash] = data;
        } else {
          taggedPersonData.push({
            prevTaggedPersons: data.taggedPersons,
            newTaggedPersons: [],
            urlHash: hash,
          });
        }
        return obj;
      },
      {}
    );
    //Remove its data from folders
    delete folders[folderHash];
    this.setState({
      contextBookmarks: [...contextBookmarks],
      folderList: { ...folderList },
      updateTaggedPersons: [...updateTaggedPersons, ...taggedPersonData],
      urlList: newUrlList,
      folders: { ...folders },
      isSaveButtonActive: true,
    });
  };

  handleSave = async () => {
    const {
      urlList,
      folders,
      folderList,
      contextBookmarks,
      updateTaggedPersons,
    } = this.state;
    const { folderContext, updateTaggedPersonUrls, displayToast } = this.props;
    this.setState({ isFetching: true });
    //Update url in tagged persons
    updateTaggedPersonUrls(updateTaggedPersons);
    //Form folders obj for current context folder
    folders[md5(folderContext)] = contextBookmarks.map(
      ({ isDir, url, name }) => ({
        isDir,
        hash: md5((isDir ? name : url) || ""),
      })
    );
    const bookmarksObj = { folderList, urlList, folders };
    await storage.set({
      [STORAGE_KEYS.bookmarks]: bookmarksObj,
      hasPendingBookmarks: true,
    });
    this.setState({ isFetching: false, isSaveButtonActive: false });
    displayToast({
      message: "Saved temporarily",
      duration: 1500,
    });
  };

  onDragStart: DragDropContextProps["onDragStart"] = async ({ source }) => {
    const { selectedBookmarks } = this.state;
    const isCurrentDraggingSelected = selectedBookmarks[source.index];
    if (!isCurrentDraggingSelected) {
      selectedBookmarks.fill(false);
      selectedBookmarks[source.index] = true;
    }
    this.setState({ selectedBookmarks: [...selectedBookmarks] });
  };

  onDragEnd: DragDropContextProps["onDragEnd"] = ({ destination, source }) => {
    if (!source || !destination || destination.index === source.index) {
      return;
    }
    const { contextBookmarks, selectedBookmarks } = this.state;
    const destIndex = getDestinationIndex(destination.index, selectedBookmarks);
    const newBookmarks = getBookmarksAfterDrag(
      contextBookmarks,
      selectedBookmarks,
      destIndex
    );
    const newSelectedBookmarks = getSelectedBookmarksAfterDrag(
      selectedBookmarks,
      destIndex
    );
    this.setState({
      contextBookmarks: newBookmarks,
      isSaveButtonActive: true,
      selectedBookmarks: newSelectedBookmarks,
    });
  };

  handleScroll = (itemNumber: number) => {
    this.listRef.current.scrollToItem(itemNumber);
  };

  render() {
    const {
      contextBookmarks,
      folderList,
      folders,
      selectedBookmarks,
      isFetching,
      isSaveButtonActive,
      searchText,
    } = this.state;
    const { folderContext } = this.props;
    const folderNamesList = getAllFolderNames(folderList);
    const filteredContextBookmarks = getFilteredContextBookmarks(
      contextBookmarks,
      searchText
    );
    const curBookmarksCount = filteredContextBookmarks.length;
    const selectedCount = getSelectedCount(selectedBookmarks);

    return (
      <>
        <GlobalStyles
          styles={{ body: { "::-webkit-scrollbar": { width: "0px" } } }}
        />
        <ScrollUpButton
          itemsSize={curBookmarksCount}
          onScroll={this.handleScroll}
        />
        <Box sx={{ width: PANEL_DIMENSIONS.width }}>
          <Header
            folderNamesList={folderNamesList}
            contextBookmarks={contextBookmarks}
            handleSave={this.handleSave}
            handleCreateNewFolder={this.handleCreateNewFolder}
            isSaveButtonActive={isSaveButtonActive}
            isFetching={isFetching}
            curFolder={folderContext}
            onSearchChange={this.handleSearchTextChange}
          />
          <EditBookmark
            curFolder={folderContext}
            onSave={this.handleBookmarkSave}
            contextBookmarks={contextBookmarks}
            folderNamesList={folderNamesList}
            handleScroll={this.handleScroll}
            handleSelectedChange={this.handleSelectedChange}
          />
          <Box sx={{ height: `${BOOKMARK_PANEL_CONTENT_HEIGHT}px` }}>
            {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
              <DragDropContext
                onDragEnd={this.onDragEnd}
                onDragStart={this.onDragStart}
              >
                <Droppable
                  droppableId="bookmarks-list"
                  mode="virtual"
                  renderClone={(provided) => (
                    <DragClone provided={provided} dragCount={selectedCount} />
                  )}
                >
                  {(provided) => (
                    <List<VirtualRowProps>
                      ref={this.listRef}
                      height={BOOKMARK_PANEL_CONTENT_HEIGHT}
                      width={PANEL_DIMENSIONS.width}
                      itemSize={BOOKMARK_ROW_DIMENTSIONS.height}
                      itemCount={curBookmarksCount}
                      overscanCount={5}
                      outerRef={provided.innerRef}
                      itemKey={(index, data) => {
                        const { isDir, url, name } =
                          data.contextBookmarks[index];
                        return (isDir ? name : url) ?? "";
                      }}
                      itemData={{
                        folderList,
                        folders,
                        selectedBookmarks,
                        folderContext,
                        contextBookmarks: filteredContextBookmarks,
                        handleFolderRemove: this.handleFolderRemove,
                        handleFolderEdit: this.handleFolderEdit,
                        resetSelectedBookmarks: this.resetSelectedBookmarks,
                        handleUrlRemove: this.handleUrlRemove,
                        handleSelectedChange: this.handleSelectedChange,
                        handleOpenSelectedBookmarks:
                          this.handleOpenSelectedBookmarks,
                        handleBulkBookmarksMove: this.handleBulkBookmarksMove,
                        handleBulkUrlRemove: this.handleBulkUrlRemove,
                      }}
                    >
                      {VirtualRow}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            ) : null}
          </Box>
        </Box>
      </>
    );
  }
}

const mapDispatchToProps = {
  displayToast,
  updateTaggedPersonUrls,
  startHistoryMonitor,
  setBookmarkOperation,
};
const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(BookmarksPanel);
