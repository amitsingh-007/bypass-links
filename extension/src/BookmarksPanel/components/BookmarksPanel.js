import { Box, GlobalStyles } from "@material-ui/core";
import storage from "ChromeApi/storage";
import tabs from "ChromeApi/tabs";
import { displayToast } from "GlobalActionCreators/toast";
import { STORAGE_KEYS } from "GlobalConstants";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { PANEL_DIMENSIONS } from "GlobalConstants/styles";
import { addToCache } from "GlobalUtils/cache";
import md5 from "md5";
import { PureComponent } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { startHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";
import { BOOKMARK_PANEL_CONTENT_HEIGHT } from "../constants";
import { bookmarksMapper } from "../mapper";
import {
  getAllFolderNames,
  getFaviconUrl,
  isFolderContainsDir,
  isFolderEmpty,
  shouldRenderBookmarks,
} from "../utils";
import Bookmark from "./Bookmark";
import Folder from "./Folder";
import Header from "./Header";
import { ScrollUpButton } from "./ScrollButton";
import { updateTaggedPersonUrls } from "SrcPath/PersonsPanel/actionCreators";
import { getBookmarks } from "SrcPath/helpers/fetchFromStorage";
import {
  getDestinationIndex,
  getBookmarksAfterDrag,
  getSelectedBookmarksAfterDrag,
} from "../utils/manipulate";

const bookmarksContainerId = "bookmarks-wrapper";

class BookmarksPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      contextBookmarks: null,
      urlList: null,
      folderList: [],
      folders: null,
      selectedBookmarks: [],
      isFetching: true,
      isSaveButtonActive: false,
      updateTaggedPersons: [],
      curDraggingBookmark: {},
    };
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
    this.initBookmarksData();
    document
      .getElementById(bookmarksContainerId)
      .addEventListener("keydown", this.handleKeyPress);
  }

  componentDidUpdate(prevProps) {
    const { folderContext } = this.props;
    if (prevProps.folderContext !== folderContext) {
      this.initBookmarksData();
    }
  }

  componentWillUnmount() {
    document
      .getElementById(bookmarksContainerId)
      .removeEventListener("keydown", this.handleKeyPress);
  }

  handleKeyPress = (event) => {
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

  handleSelectedChange = (pos, isOnlySelection) => {
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

  handleCreateNewFolder = (name) => {
    const { contextBookmarks, folderList } = this.state;
    const { folderContext } = this.props;
    const isDir = true;
    const nameHash = md5(name);
    //Update current context folder
    contextBookmarks.unshift({ isDir, name });
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
  };

  updatePersonUrls = (
    prevTaggedPersons = [],
    newTaggedPersons = [],
    urlHash
  ) => {
    const { updateTaggedPersons } = this.state;
    this.setState({
      updateTaggedPersons: [
        ...updateTaggedPersons,
        { prevTaggedPersons, newTaggedPersons, urlHash },
      ],
    });
  };

  handleBookmarkSave = (
    url,
    title,
    oldFolder,
    newFolder,
    pos,
    prevTaggedPersons,
    newTaggedPersons
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

  handleAddNewBookmark = (url, title, folder, taggedPersons) => {
    const { contextBookmarks } = this.state;
    const { folderContext } = this.props;
    this.handleBookmarkSave(
      url,
      title,
      folderContext,
      folder,
      contextBookmarks.length,
      [],
      taggedPersons
    );
  };

  handleBulkBookmarksMove = (destFolder) => {
    const { contextBookmarks, selectedBookmarks, folders, urlList } =
      this.state;
    const bookmarksToMove = contextBookmarks
      .filter((_bookmark, index) => Boolean(selectedBookmarks[index]))
      .map(({ url }) => md5(url));
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

  handleUrlRemove = (pos, url) => {
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
    const taggedPersonData = [];
    //Remove from current context folder
    const filteredContextBookmarks = contextBookmarks.filter(
      (bookmark, index) => {
        if (selectedBookmarks[index]) {
          const urlHash = md5(bookmark.url);
          //Update url in tagged persons
          taggedPersonData.push({
            prevTaggedPersons: bookmark.taggedPersons,
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

  handleFolderEdit = (oldName, newName, pos) => {
    const { contextBookmarks, folderList, folders, urlList } = this.state;
    const oldFolderHash = md5(oldName);
    const newFolderHash = md5(newName);
    //Update parentHash in urlList
    const newUrlList = Object.entries(urlList).reduce((obj, [hash, data]) => {
      if (data.parentHash === oldFolderHash) {
        obj[hash] = { ...data, parentHash: newFolderHash };
      } else {
        obj[hash] = data;
      }
      return obj;
    }, {});
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

  handleFolderRemove = (pos, name) => {
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
    const taggedPersonData = [];
    const newUrlList = Object.entries(urlList).reduce((obj, [hash, data]) => {
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
    }, {});
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
    const { folderContext } = this.props;
    this.setState({ isFetching: true });
    //Update url in tagged persons
    this.props.updateTaggedPersonUrls(updateTaggedPersons);
    //Form folders obj for current context folder
    folders[md5(folderContext)] = contextBookmarks.map(
      ({ isDir, url, name }) => ({
        isDir,
        hash: md5(isDir ? name : url),
      })
    );
    const bookmarksObj = { folderList, urlList, folders };
    await storage.set({
      [STORAGE_KEYS.bookmarks]: bookmarksObj,
      hasPendingBookmarks: true,
    });
    this.setState({ isFetching: false, isSaveButtonActive: false });
    this.props.displayToast({
      message: "Saved temporarily",
      duration: 1500,
    });
  };

  onDragStart = async ({ draggableId, source }) => {
    const { selectedBookmarks } = this.state;
    const isCurrentDraggingSelected = selectedBookmarks[source.index];
    if (!isCurrentDraggingSelected) {
      selectedBookmarks.fill(false);
      selectedBookmarks[source.index] = true;
    }
    this.setState({
      curDraggingBookmark: {
        uid: md5(draggableId),
        dragCount: selectedBookmarks.filter(Boolean).length,
      },
      selectedBookmarks: [...selectedBookmarks],
    });
  };

  onDragEnd = ({ destination, source }) => {
    this.setState({ curDraggingBookmark: {} });
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

  render() {
    const {
      contextBookmarks,
      folderList,
      folders,
      selectedBookmarks,
      isFetching,
      isSaveButtonActive,
      curDraggingBookmark,
    } = this.state;
    const { bmUrl, bmTitle, addBookmark, editBookmark, folderContext } =
      this.props;
    const folderNamesList = getAllFolderNames(folderList);
    const selectedCount = selectedBookmarks.filter(Boolean).length;

    return (
      <>
        <GlobalStyles
          styles={{
            body: { "::-webkit-scrollbar": { width: "0px" } },
          }}
        />
        <ScrollUpButton
          containerId={bookmarksContainerId}
          bookmarks={contextBookmarks}
        />
        <Box sx={{ width: PANEL_DIMENSIONS.width }}>
          <Header
            folderNamesList={folderNamesList}
            contextBookmarks={contextBookmarks}
            handleSave={this.handleSave}
            handleCreateNewFolder={this.handleCreateNewFolder}
            handleAddNewBookmark={this.handleAddNewBookmark}
            showBookmarkDialog={addBookmark && !isFetching}
            url={bmUrl}
            title={bmTitle}
            isSaveButtonActive={isSaveButtonActive}
            isFetching={isFetching}
            curFolder={folderContext}
          />
          <DragDropContext
            onDragEnd={this.onDragEnd}
            onDragStart={this.onDragStart}
          >
            <Droppable droppableId="bookmarks-list">
              {(provided) => (
                <Box
                  id={bookmarksContainerId}
                  component="form"
                  noValidate
                  autoComplete="off"
                  sx={{
                    minHeight: `${BOOKMARK_PANEL_CONTENT_HEIGHT}px`,
                    padding: "4px 0px",
                  }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {shouldRenderBookmarks(folders, contextBookmarks)
                    ? contextBookmarks.map(
                        ({ url, title, name, taggedPersons, isDir }, index) =>
                          isDir ? (
                            <Folder
                              key={name}
                              pos={index}
                              isDir={isDir}
                              name={name}
                              handleRemove={this.handleFolderRemove}
                              handleEdit={this.handleFolderEdit}
                              isEmpty={isFolderEmpty(folders, name)}
                              curDraggingBookmark={curDraggingBookmark}
                              resetSelectedBookmarks={
                                this.resetSelectedBookmarks
                              }
                            />
                          ) : (
                            <Bookmark
                              key={url}
                              pos={index}
                              isDir={isDir}
                              url={url}
                              title={title}
                              curFolder={folderContext}
                              taggedPersons={taggedPersons}
                              isSelected={Boolean(selectedBookmarks[index])}
                              selectedCount={selectedCount}
                              folder={folderContext}
                              folderNamesList={folderNamesList}
                              handleSave={this.handleBookmarkSave}
                              handleRemove={this.handleUrlRemove}
                              handleSelectedChange={this.handleSelectedChange}
                              handleOpenSelectedBookmarks={
                                this.handleOpenSelectedBookmarks
                              }
                              handleBulkBookmarksMove={
                                this.handleBulkBookmarksMove
                              }
                              handleBulkUrlRemove={this.handleBulkUrlRemove}
                              editBookmark={
                                editBookmark &&
                                url === bmUrl &&
                                title === bmTitle
                              }
                              curDraggingBookmark={curDraggingBookmark}
                            />
                          )
                      )
                    : null}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      displayToast,
      updateTaggedPersonUrls,
      startHistoryMonitor,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(BookmarksPanel);
