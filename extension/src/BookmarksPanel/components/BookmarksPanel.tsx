import { Box, GlobalStyles } from '@mui/material';
import { displayToast } from 'GlobalActionCreators/toast';
import { ScrollButton } from '@common/components/ScrollButton';
import { CACHE_BUCKET_KEYS } from '@common/constants/cache';
import { PANEL_DIMENSIONS_PX } from 'GlobalConstants/styles';
import tabs from 'GlobalHelpers/chrome/tabs';
import { getBookmarks } from 'GlobalHelpers/fetchFromStorage';
import { addToCache } from '@common/utils/cache';
import md5 from 'md5';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  DragDropContext,
  DragDropContextProps,
  Droppable,
} from '@hello-pangea/dnd';
import { useDispatch } from 'react-redux';
import { FixedSizeList } from 'react-window';
import { startHistoryMonitor } from 'SrcPath/HistoryPanel/actionCreators';
import { updateTaggedPersonUrls } from 'SrcPath/PersonsPanel/actionCreators';
import { IUpdateTaggedPerson } from '@common/components/Persons/interfaces/persons';
import { setBookmarkOperation } from '../actionCreators';
import {
  BOOKMARK_PANEL_CONTENT_HEIGHT,
  BOOKMARK_ROW_DIMENTSIONS,
} from '../constants';
import { BOOKMARK_OPERATION } from '@common/components/Bookmarks/constants';
import {
  ContextBookmarks,
  IBookmarksObj,
  ISelectedBookmarks,
} from '@common/components/Bookmarks/interfaces';
import { BMPanelQueryParams } from '@common/components/Bookmarks/interfaces/url';
import {
  bookmarksMapper,
  getEncryptedBookmark,
} from '@common/components/Bookmarks/mapper';
import {
  getAllFolderNames,
  getSelectedCount,
  isFolderContainsDir,
  setBookmarksInStorage,
} from '../utils';
import { getFaviconProxyUrl } from '@common/utils';
import {
  getBookmarksAfterDrag,
  getDestinationIndex,
  getSelectedBookmarksAfterDrag,
} from '../utils/manipulate';
import BookmarkContextMenu from './BookmarkContextMenu';
import DragClone from './DragClone';
import EditBookmark from './EditBookmark';
import Header from './Header';
import VirtualRow, { VirtualRowProps } from './VirtualRow';
import {
  getFilteredContextBookmarks,
  shouldRenderBookmarks,
} from '@common/components/Bookmarks/utils';

const minReqBookmarksToScroll = Math.ceil(
  BOOKMARK_PANEL_CONTENT_HEIGHT / BOOKMARK_ROW_DIMENTSIONS.height
);

const BookmarksPanel = memo<BMPanelQueryParams>(function BookmarksPanel({
  folderContext,
  operation,
  bmUrl,
}) {
  const dispatch = useDispatch();
  const listRef = useRef<any>();
  const [contextBookmarks, setContextBookmarks] = useState<ContextBookmarks>(
    []
  );
  const [urlList, setUrlList] = useState<IBookmarksObj['urlList']>({});
  const [folderList, setFolderList] = useState<IBookmarksObj['folderList']>({});
  const [folders, setFolders] = useState<IBookmarksObj['folders']>({});
  const [selectedBookmarks, setSelectedBookmarks] =
    useState<ISelectedBookmarks>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaveButtonActive, setIsSaveButtonActive] = useState(false);
  const [updateTaggedPersons, setUpdateTaggedPersons] = useState<
    IUpdateTaggedPerson[]
  >([]);
  const [searchText, setSearchText] = useState('');

  const initBookmarksData = useCallback(async () => {
    setIsSaveButtonActive(false);
    setIsFetching(true);
    const { folders, urlList, folderList } = await getBookmarks();
    const folderContextHash = md5(folderContext);
    const modifiedBookmarks = Object.entries(folders[folderContextHash]).map(
      (kvp) => bookmarksMapper(kvp, urlList, folderList)
    );
    setContextBookmarks(modifiedBookmarks);
    setUrlList(urlList);
    setFolderList(folderList);
    setFolders(folders);
    setSelectedBookmarks([]);
    setIsFetching(false);
  }, [folderContext]);

  const handleOpenSelectedBookmarks = useCallback(() => {
    dispatch(startHistoryMonitor());
    contextBookmarks.forEach(({ url }, index) => {
      if (selectedBookmarks[index]) {
        tabs.create({ url, selected: false });
      }
    });
  }, [contextBookmarks, dispatch, selectedBookmarks]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetSelectedBookmarks();
      } else if (event.key === 'Enter') {
        const target = event.target as HTMLElement;
        // To prevent from opening links on saving bookmarks using keys
        if (target.nodeName !== 'BUTTON' && target.nodeName !== 'INPUT') {
          handleOpenSelectedBookmarks();
        }
      }
    },
    [handleOpenSelectedBookmarks]
  );

  useEffect(() => {
    initBookmarksData().then(() => {
      handleScroll(0);
    });
  }, [initBookmarksData]);

  useEffect(() => {
    if (!isFetching && operation !== BOOKMARK_OPERATION.NONE) {
      /**
       * Need to call after initBookmarksData,
       * Since EditBookmark internally needs contextBookmarks to be set beforehand
       */
      dispatch(setBookmarkOperation(operation, bmUrl));
    }
  }, [bmUrl, dispatch, isFetching, operation]);

  useEffect(() => {
    document.body.addEventListener('keydown', handleKeyPress);
    return () => {
      document.body.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleSearchTextChange = (text: string) => setSearchText(text);

  const updatePersonUrls = useCallback(
    (
      prevTaggedPersons: string[] = [],
      newTaggedPersons: string[] = [],
      urlHash: string
    ) =>
      setUpdateTaggedPersons([
        ...updateTaggedPersons,
        {
          prevTaggedPersons,
          newTaggedPersons,
          urlHash,
        },
      ]),
    [updateTaggedPersons]
  );

  const handleSelectedChange = useCallback(
    (pos: number, isOnlySelection: boolean) => {
      if (isOnlySelection) {
        selectedBookmarks.fill(false);
      }
      selectedBookmarks[pos] = !selectedBookmarks[pos];
      setSelectedBookmarks([...selectedBookmarks]);
    },
    [selectedBookmarks]
  );

  const resetSelectedBookmarks = () => setSelectedBookmarks([]);

  const handleCreateNewFolder = useCallback(
    (name: string) => {
      const isDir = true;
      const nameHash = md5(name);
      //Update current context folder
      contextBookmarks?.unshift({ isDir, name });
      //Update data in all folders list
      folderList[nameHash] = {
        name: btoa(name),
        parentHash: md5(folderContext),
      };
      setContextBookmarks([...contextBookmarks]);
      setFolderList({ ...folderList });
      setIsSaveButtonActive(true);
      handleScroll(0);
    },
    [contextBookmarks, folderContext, folderList]
  );

  const handleBookmarkSave = useCallback(
    (
      url: string,
      title: string,
      oldFolder: string,
      newFolder: string,
      pos: number,
      prevTaggedPersons: string[],
      newTaggedPersons: string[]
    ) => {
      const isFolderChange = oldFolder !== newFolder;
      const isDir = false;
      const urlHash = md5(url);
      const newFolderHash = md5(newFolder);
      //Update url in tagged persons
      updatePersonUrls(prevTaggedPersons, newTaggedPersons, urlHash);
      //Update urlList with new values
      urlList[urlHash] = getEncryptedBookmark({
        url,
        title,
        taggedPersons: [...newTaggedPersons],
        parentHash: newFolderHash,
      });
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
      //Add bookmark favicon in the cache
      addToCache(CACHE_BUCKET_KEYS.favicon, getFaviconProxyUrl(url));
      setUrlList({ ...urlList });
      setContextBookmarks([...newBookmarks]);
      setIsSaveButtonActive(true);
    },
    [contextBookmarks, folders, updatePersonUrls, urlList]
  );

  const handleBulkBookmarksMove = useCallback(
    (destFolder: string) => {
      const bookmarksToMove = contextBookmarks
        .filter((bookmark, index) =>
          Boolean(selectedBookmarks[index] && bookmark.url)
        )
        .map(({ url = '' }) => md5(url));
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
      setUrlList({ ...urlList });
      setFolders({ ...folders });
      setContextBookmarks(updatedBookmarksInOldFolder);
      setSelectedBookmarks([]);
      setIsSaveButtonActive(true);
    },
    [contextBookmarks, folders, selectedBookmarks, urlList]
  );

  const handleUrlRemove = useCallback(
    (pos: number, url: string) => {
      const urlHash = md5(url);
      //Update url in tagged persons
      updatePersonUrls(contextBookmarks[pos].taggedPersons, [], urlHash);
      //Remove from current context folder
      contextBookmarks.splice(pos, 1);
      //Remove from all urls list
      const newUrlList = { ...urlList };
      delete newUrlList[urlHash];
      setContextBookmarks([...contextBookmarks]);
      setUrlList(newUrlList);
      setIsSaveButtonActive(true);
      setSelectedBookmarks([]);
    },
    [contextBookmarks, updatePersonUrls, urlList]
  );

  const handleBulkUrlRemove = useCallback(() => {
    const newUrlList = { ...urlList };
    const taggedPersonData: IUpdateTaggedPerson[] = [];
    //Remove from current context folder
    const filteredContextBookmarks = contextBookmarks.filter(
      (bookmark, index) => {
        if (selectedBookmarks[index]) {
          const urlHash = md5(bookmark.url || '');
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
    setContextBookmarks(filteredContextBookmarks);
    setUpdateTaggedPersons(taggedPersonData);
    setUrlList(newUrlList);
    setIsSaveButtonActive(true);
    setSelectedBookmarks([]);
  }, [contextBookmarks, selectedBookmarks, urlList]);

  const handleFolderEdit = useCallback(
    (oldName: string, newName: string, pos: number) => {
      const oldFolderHash = md5(oldName);
      const newFolderHash = md5(newName);
      //Update parentHash in urlList
      const newUrlList = Object.entries(urlList).reduce<
        IBookmarksObj['urlList']
      >((obj, [hash, data]) => {
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
      setUrlList(newUrlList);
      setFolderList({ ...folderList });
      setFolders({ ...folders });
      setContextBookmarks([...contextBookmarks]);
      setIsSaveButtonActive(true);
    },
    [contextBookmarks, folderList, folders, urlList]
  );

  const handleFolderRemove = useCallback(
    (pos: number, name: string) => {
      const folderHash = md5(name);
      if (isFolderContainsDir(folders, folderHash)) {
        dispatch(
          displayToast({
            message: 'Remove inner folders first.',
            severity: 'error',
          })
        );
        return;
      }
      //Remove from current context folder
      contextBookmarks.splice(pos, 1);
      //Remove from all folders list
      delete folderList[folderHash];
      //Remove all urls inside the folder and update all urls in tagged persons
      const taggedPersonData: IUpdateTaggedPerson[] = [];
      const newUrlList = Object.entries(urlList).reduce<
        IBookmarksObj['urlList']
      >((obj, [hash, data]) => {
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
      setContextBookmarks([...contextBookmarks]);
      setFolderList({ ...folderList });
      setUpdateTaggedPersons([...updateTaggedPersons, ...taggedPersonData]);
      setUrlList(newUrlList);
      setFolders({ ...folders });
      setIsSaveButtonActive(true);
    },
    [
      contextBookmarks,
      dispatch,
      folderList,
      folders,
      updateTaggedPersons,
      urlList,
    ]
  );

  const handleSave = useCallback(async () => {
    setIsFetching(true);
    //Update url in tagged persons
    dispatch(updateTaggedPersonUrls(updateTaggedPersons));
    //Form folders obj for current context folder
    folders[md5(folderContext)] = contextBookmarks.map(
      ({ isDir, url, name }) => ({
        isDir,
        hash: md5((isDir ? name : url) || ''),
      })
    );
    const bookmarksObj: IBookmarksObj = { folderList, urlList, folders };
    await setBookmarksInStorage(bookmarksObj);
    setIsFetching(false);
    setIsSaveButtonActive(false);
    dispatch(
      displayToast({
        message: 'Saved temporarily',
        duration: 1500,
      })
    );
  }, [
    contextBookmarks,
    dispatch,
    folderContext,
    folderList,
    folders,
    updateTaggedPersons,
    urlList,
  ]);

  const handleMoveBookmarks = useCallback(
    (destinationIndex: number) => {
      const destIndex = getDestinationIndex(
        destinationIndex,
        selectedBookmarks
      );
      const newBookmarks = getBookmarksAfterDrag(
        contextBookmarks,
        selectedBookmarks,
        destIndex
      );
      const newSelectedBookmarks = getSelectedBookmarksAfterDrag(
        selectedBookmarks,
        destIndex
      );
      setContextBookmarks(newBookmarks);
      setIsSaveButtonActive(true);
      setSelectedBookmarks(newSelectedBookmarks);
    },
    [contextBookmarks, selectedBookmarks]
  );

  const onDragStart = useCallback<
    NonNullable<DragDropContextProps['onDragStart']>
  >(
    async ({ source }) => {
      const isCurrentDraggingSelected = selectedBookmarks[source.index];
      if (!isCurrentDraggingSelected) {
        selectedBookmarks.fill(false);
        selectedBookmarks[source.index] = true;
      }
      setSelectedBookmarks([...selectedBookmarks]);
    },
    [selectedBookmarks]
  );

  const onDragEnd = useCallback<DragDropContextProps['onDragEnd']>(
    ({ destination, source }) => {
      if (!source || !destination || destination.index === source.index) {
        return;
      }
      handleMoveBookmarks(destination.index);
    },
    [handleMoveBookmarks]
  );

  const handleScroll = (itemNumber: number) =>
    listRef.current?.scrollToItem(itemNumber);

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
        styles={{ body: { '::-webkit-scrollbar': { width: '0px' } } }}
      />
      <ScrollButton
        itemsSize={curBookmarksCount}
        onScroll={handleScroll}
        minItemsReqToShow={minReqBookmarksToScroll}
      />
      <Box sx={{ width: PANEL_DIMENSIONS_PX.width }}>
        <Header
          folderNamesList={folderNamesList}
          contextBookmarks={contextBookmarks}
          handleSave={handleSave}
          handleCreateNewFolder={handleCreateNewFolder}
          isSaveButtonActive={isSaveButtonActive}
          isFetching={isFetching}
          curFolder={folderContext}
          onSearchChange={handleSearchTextChange}
        />
        <EditBookmark
          curFolder={folderContext}
          onSave={handleBookmarkSave}
          onDelete={handleUrlRemove}
          contextBookmarks={contextBookmarks}
          folderNamesList={folderNamesList}
          handleScroll={handleScroll}
          handleSelectedChange={handleSelectedChange}
        />
        <BookmarkContextMenu
          curFolder={folderContext}
          contextBookmarks={contextBookmarks}
          folderNamesList={folderNamesList}
          selectedBookmarks={selectedBookmarks}
          handleBulkUrlRemove={handleBulkUrlRemove}
          handleUrlRemove={handleUrlRemove}
          handleBulkBookmarksMove={handleBulkBookmarksMove}
          handleOpenSelectedBookmarks={handleOpenSelectedBookmarks}
          handleMoveBookmarks={handleMoveBookmarks}
          handleScroll={handleScroll}
        >
          {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
            <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
              <Droppable
                droppableId="bookmarks-list"
                mode="virtual"
                renderClone={(provided) => (
                  <DragClone provided={provided} dragCount={selectedCount} />
                )}
              >
                {(provided) => (
                  <FixedSizeList<VirtualRowProps>
                    ref={listRef}
                    height={BOOKMARK_PANEL_CONTENT_HEIGHT}
                    width={PANEL_DIMENSIONS_PX.width}
                    itemSize={BOOKMARK_ROW_DIMENTSIONS.height}
                    itemCount={curBookmarksCount}
                    overscanCount={5}
                    outerRef={provided.innerRef}
                    itemKey={(index, data) => {
                      const { isDir, url, name } = data.contextBookmarks[index];
                      return (isDir ? name : url) ?? '';
                    }}
                    itemData={{
                      folderNamesList,
                      folders,
                      selectedBookmarks,
                      contextBookmarks: filteredContextBookmarks,
                      handleFolderRemove: handleFolderRemove,
                      handleFolderEdit: handleFolderEdit,
                      resetSelectedBookmarks: resetSelectedBookmarks,
                      handleSelectedChange: handleSelectedChange,
                    }}
                    style={{ overflowY: 'scroll' }}
                  >
                    {VirtualRow}
                  </FixedSizeList>
                )}
              </Droppable>
            </DragDropContext>
          ) : null}
        </BookmarkContextMenu>
      </Box>
    </>
  );
});

export default BookmarksPanel;
