import { Box } from "@material-ui/core";
import storage from "ChromeApi/storage";
import {
  displayToast,
  updateTaggedPersonUrls,
} from "GlobalActionCreators/index";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { PANEL_DIMENSIONS } from "GlobalConstants/styles";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { getBookmarksObj } from "SrcPath/BookmarksPanel/utils/bookmark";
import {
  getAllFolderNames,
  getFaviconUrl,
  isFolderContainsDir,
  isFolderEmpty,
} from "../utils/index";
import Bookmark from "./Bookmark";
import Folder from "./Folder";
import Header from "./Header";

const contentHeight = "532px";

const shouldRenderBookmarks = (folders, contextBookmarks) =>
  folders && contextBookmarks && contextBookmarks.length > 0;

//Resolve and map content into req format
const mapper = ([_key, { isDir, hash }], urlList, folderList) => {
  const obj = { isDir };
  const content = isDir ? folderList[hash] : urlList[hash];
  if (isDir) {
    obj.name = atob(content.name);
  } else {
    obj.url = decodeURIComponent(atob(content.url));
    obj.title = decodeURIComponent(atob(content.title));
    obj.taggedPersons = content.taggedPersons || [];
    //To preload images on client side runtime
    new Image().src = getFaviconUrl(obj.url);
  }
  return obj;
};

const BookmarksPanel = memo(
  ({ folderContext, bmUrl, bmTitle, editBookmark, addBookmark, ...props }) => {
    const dispatch = useDispatch();
    const [contextBookmarks, setContextBookmarks] = useState(null);
    const [urlList, setUrlList] = useState(null);
    const [folderList, setFolderList] = useState([]);
    const [folders, setFolders] = useState(null);
    const [selectedBookmarks, setSelectedBookmarks] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaveButtonActive, setIsSaveButtonActive] = useState(false);
    const [updateTaggedPersons, setUpdateTaggedPersons] = useState([]);

    const initBookmarks = async () => {
      setIsFetching(true);
      const { folders, urlList, folderList } = await getBookmarksObj();
      const folderContextHash = md5(folderContext);
      const modifiedBookmarks = Object.entries(
        folders[folderContextHash]
      ).map((kvp) => mapper(kvp, urlList, folderList));
      setContextBookmarks(modifiedBookmarks);
      setUrlList(urlList);
      setFolderList(folderList);
      setFolders(folders);
      setSelectedBookmarks([]);
      setIsFetching(false);
    };

    useEffect(() => {
      initBookmarks();
      setIsSaveButtonActive(false);
    }, [folderContext]);

    const handleClose = () => {
      props.history.goBack();
    };

    const handleSelectedChange = (pos) => {
      selectedBookmarks[pos] = !selectedBookmarks[pos];
      setSelectedBookmarks([...selectedBookmarks]);
    };

    const handleAddNewBookmark = (url, title, folder, taggedPersons) => {
      handleBookmarkSave(
        url,
        title,
        folderContext,
        folder,
        contextBookmarks.length,
        [],
        taggedPersons
      );
    };

    const handleCreateNewFolder = (name) => {
      const isDir = true;
      const nameHash = md5(name);
      //Update current context folder
      contextBookmarks.unshift({ isDir, name });
      setContextBookmarks([...contextBookmarks]);
      //Update data in all folders list
      folderList[nameHash] = {
        name: btoa(name),
        parentHash: md5(folderContext),
      };
      setFolderList({ ...folderList });
      setIsSaveButtonActive(true);
    };

    const updatePersonUrls = (
      prevTaggedPersons = [],
      newTaggedPersons = [],
      urlHash
    ) => {
      setUpdateTaggedPersons([
        ...updateTaggedPersons,
        { prevTaggedPersons, newTaggedPersons, urlHash },
      ]);
    };

    const handleBookmarkSave = (
      url,
      title,
      oldFolder,
      newFolder,
      pos,
      prevTaggedPersons,
      newTaggedPersons
    ) => {
      const isFolderChange = oldFolder !== newFolder;
      const isDir = false;
      const urlHash = md5(url);
      const newFolderHash = md5(newFolder);
      //Update url in tagged persons
      updatePersonUrls(prevTaggedPersons, newTaggedPersons, urlHash);
      //Update urlList with new values
      urlList[urlHash] = {
        url: btoa(encodeURIComponent(url)),
        title: btoa(encodeURIComponent(title)),
        taggedPersons: newTaggedPersons,
        parentHash: newFolderHash,
      };
      setUrlList({ ...urlList });
      //Update folders and current context folder content based on dir change
      const newBookmarks = contextBookmarks;
      if (isFolderChange) {
        folders[newFolderHash] = folders[newFolderHash] || []; //to handle empty folders
        folders[newFolderHash].push({ isDir, hash: urlHash });
        setFolders({ ...folders });
        newBookmarks.splice(pos, 1);
      } else {
        newBookmarks[pos] = {
          url,
          title,
          taggedPersons: newTaggedPersons,
          isDir,
        };
      }
      setContextBookmarks([...newBookmarks]);
      setIsSaveButtonActive(true);
    };

    const handleBulkBookmarksMove = (destFolder) => {
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
      setUrlList({ ...urlList });
      //Add to destination folder
      folders[destFolderHash] = (folders[destFolderHash] || []).concat(
        bookmarksToMove.map((urlHash) => ({ isDir: false, hash: urlHash }))
      );
      setFolders({ ...folders });
      //Remove from old folder, ie, contextBookmarks
      const updatedBookmarksInOldFolder = contextBookmarks.filter(
        (_bookmark, index) => !selectedBookmarks[index]
      );
      setContextBookmarks(updatedBookmarksInOldFolder);
      setSelectedBookmarks([]);
      setIsSaveButtonActive(true);
    };

    const handleUrlRemove = (pos, url) => {
      const urlHash = md5(url);
      //Update url in tagged persons
      updatePersonUrls(contextBookmarks[pos].taggedPersons, [], urlHash);
      //Remove from current context folder
      contextBookmarks.splice(pos, 1);
      setContextBookmarks([...contextBookmarks]);
      //Remove from all urls list
      const newUrlList = { ...urlList };
      delete newUrlList[urlHash];
      setUrlList(newUrlList);
      setIsSaveButtonActive(true);
    };

    const handleFolderEdit = (oldName, newName, pos) => {
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
      setUrlList(newUrlList);
      //Update name in folderList
      folderList[newFolderHash] = {
        ...folderList[oldFolderHash],
        name: btoa(newName),
      };
      delete folderList[oldFolderHash];
      setFolderList({ ...folderList });
      //Update in folders
      folders[newFolderHash] = folders[oldFolderHash];
      delete folders[oldFolderHash];
      setFolders({ ...folders });
      //Update current folder
      contextBookmarks[pos] = { ...contextBookmarks[pos], name: newName };
      setContextBookmarks([...contextBookmarks]);
      setIsSaveButtonActive(true);
    };

    const handleFolderRemove = (pos, name) => {
      const folderHash = md5(name);
      if (isFolderContainsDir(folders, folderHash)) {
        dispatch(
          displayToast({
            message: "Remove inner folders first.",
            severity: "error",
          })
        );
        return;
      }
      //Remove from current context folder
      contextBookmarks.splice(pos, 1);
      setContextBookmarks([...contextBookmarks]);
      //Remove from all folders list
      delete folderList[folderHash];
      setFolderList({ ...folderList });
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
      setUpdateTaggedPersons([...updateTaggedPersons, ...taggedPersonData]);
      setUrlList(newUrlList);
      //Remove its data from folders
      delete folders[folderHash];
      setFolders({ ...folders });
      setIsSaveButtonActive(true);
    };

    const handleSave = async () => {
      setIsFetching(true);
      //Update url in tagged persons
      dispatch(updateTaggedPersonUrls(updateTaggedPersons));
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
      setIsFetching(false);
      setIsSaveButtonActive(false);
      dispatch(
        displayToast({
          message: "Saved temporarily",
          duration: 1500,
        })
      );
    };

    const onDragEnd = ({ destination, source }) => {
      if (!source || !destination || destination.index === source.index) {
        return;
      }
      const newBookmarks = Array.from(contextBookmarks);
      const draggedBookmark = contextBookmarks[source.index];
      newBookmarks.splice(source.index, 1);
      newBookmarks.splice(destination.index, 0, draggedBookmark);
      setContextBookmarks(newBookmarks);
      setIsSaveButtonActive(true);
    };

    const folderNamesList = getAllFolderNames(folderList);
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            width: PANEL_DIMENSIONS.width,
            paddingBottom: "8px",
          }}
        >
          <Header
            folderNamesList={folderNamesList}
            selectedBookmarks={selectedBookmarks}
            contextBookmarks={contextBookmarks}
            handleClose={handleClose}
            handleSave={handleSave}
            handleCreateNewFolder={handleCreateNewFolder}
            handleAddNewBookmark={handleAddNewBookmark}
            showBookmarkDialog={addBookmark && !isFetching}
            handleBulkBookmarksMove={handleBulkBookmarksMove}
            url={bmUrl}
            title={bmTitle}
            isSaveButtonActive={isSaveButtonActive}
            curFolder={folderContext}
            isFetching={isFetching}
          />
          <Droppable droppableId="bookmarks-list">
            {(provided) => (
              <Box
                component="form"
                noValidate
                autoComplete="off"
                sx={{ minHeight: contentHeight }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {shouldRenderBookmarks(folders, contextBookmarks) &&
                  contextBookmarks.map(
                    ({ url, title, name, taggedPersons, isDir }, index) =>
                      isDir ? (
                        <Folder
                          key={name}
                          pos={index}
                          isDir={isDir}
                          name={name}
                          handleRemove={handleFolderRemove}
                          handleEdit={handleFolderEdit}
                          isEmpty={isFolderEmpty(folders, name)}
                        />
                      ) : (
                        <Bookmark
                          key={url}
                          pos={index}
                          isDir={isDir}
                          url={url}
                          title={title}
                          taggedPersons={taggedPersons}
                          isSelected={Boolean(selectedBookmarks[index])}
                          folder={folderContext}
                          folderNamesList={folderNamesList}
                          handleSave={handleBookmarkSave}
                          handleRemove={handleUrlRemove}
                          handleSelectedChange={handleSelectedChange}
                          editBookmark={
                            editBookmark && url === bmUrl && title === bmTitle
                          }
                        />
                      )
                  )}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Box>
      </DragDropContext>
    );
  }
);

export default BookmarksPanel;
