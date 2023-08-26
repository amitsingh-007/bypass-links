import { MAX_PANEL_SIZE } from '@/constants';
import {
  BMPanelQueryParams,
  BOOKMARK_OPERATION,
  CACHE_BUCKET_KEYS,
  ContextBookmarks,
  IBookmarksObj,
  ISelectedBookmarks,
  IUpdateTaggedPerson,
  ScrollButton,
  addToCache,
  bookmarksMapper,
  getBookmarkId,
  getEncryptedBookmark,
  getFaviconProxyUrl,
  getFilteredContextBookmarks,
  shouldRenderBookmarks,
} from '@bypass/shared';
import {
  DndContext,
  DndContextProps,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getBookmarks } from '@helpers/fetchFromStorage';
import { Box, Flex } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import useBookmarkStore from '@store/bookmark';
import useHistoryStore from '@store/history';
import usePersonStore from '@store/person';
import useToastStore from '@store/toast';
import md5 from 'md5';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FixedSizeList } from 'react-window';
import { BOOKMARK_ROW_HEIGHT } from '../constants';
import {
  getAllFolderNames,
  isFolderContainsDir,
  setBookmarksInStorage,
} from '../utils';
import {
  getBookmarksAfterDrag,
  getDestinationIndex,
  getSelectedBookmarksAfterDrag,
} from '../utils/manipulate';
import BookmarkAddEditDialog from './BookmarkAddEditDialog';
import BookmarkContextMenu from './BookmarkContextMenu';
import BookmarksHeader from './BookmarksHeader';
import DragClone from './DragClone';
import VirtualRow, { VirtualRowProps } from './VirtualRow';

const BookmarksPanel = memo<BMPanelQueryParams>(function BookmarksPanel({
  folderContext,
  operation,
  bmUrl,
}) {
  const {
    ref: bodyRef,
    width: bodyWidth,
    height: bodyHeight,
  } = useElementSize();
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const displayToast = useToastStore((state) => state.displayToast);
  const updateTaggedPersonUrls = usePersonStore(
    (state) => state.updateTaggedPersonUrls
  );
  const setBookmarkOperation = useBookmarkStore(
    (state) => state.setBookmarkOperation
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
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
  const [isDragging, setIsDragging] = useState(false);

  const initBookmarksData = useCallback(async () => {
    setIsSaveButtonActive(false);
    setIsFetching(true);
    const {
      folders: foldersData,
      urlList: urlListData,
      folderList: folderListData,
    } = await getBookmarks();
    const folderContextHash = md5(folderContext);
    const modifiedBookmarks = Object.entries(
      foldersData[folderContextHash]
    ).map((kvp) => bookmarksMapper(kvp, urlListData, folderListData));
    setContextBookmarks(modifiedBookmarks);
    setUrlList(urlListData);
    setFolderList(folderListData);
    setFolders(foldersData);
    setSelectedBookmarks([]);
    setIsFetching(false);
  }, [folderContext]);

  const handleOpenSelectedBookmarks = useCallback(() => {
    startHistoryMonitor();
    contextBookmarks.forEach((bookmark, index) => {
      if (selectedBookmarks[index] && !bookmark.isDir) {
        chrome.tabs.create({ url: bookmark.url, active: false });
      }
    });
  }, [contextBookmarks, selectedBookmarks, startHistoryMonitor]);

  const handleScroll = (itemNumber: number) =>
    listRef.current?.scrollToItem(itemNumber);

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
      setBookmarkOperation(operation, bmUrl);
    }
  }, [bmUrl, isFetching, operation, setBookmarkOperation]);

  const updatePersonUrls = useCallback(
    (
      urlHash: string,
      prevTaggedPersons: string[] = [],
      newTaggedPersons: string[] = []
    ) =>
      setUpdateTaggedPersons((prev) => [
        ...prev,
        {
          prevTaggedPersons,
          newTaggedPersons,
          urlHash,
        },
      ]),
    []
  );

  const handleSelectedChange = useCallback(
    (pos: number, isOnlySelection: boolean) => {
      setSelectedBookmarks((prev) => {
        const newValue = [...prev];
        if (isOnlySelection) {
          newValue.fill(false);
        }
        newValue[pos] = !newValue[pos];
        return newValue;
      });
    },
    []
  );

  const resetSelectedBookmarks = () => setSelectedBookmarks([]);

  const handleCreateNewFolder = useCallback(
    (name: string) => {
      const isDir = true;
      const nameHash = md5(name);
      // Update current context folder
      setContextBookmarks((prev) => {
        const newValue = [...prev];
        newValue.unshift({ isDir, name });
        return newValue;
      });
      // Update data in all folders list
      setFolderList((prev) => {
        const newValue = { ...prev };
        newValue[nameHash] = {
          name: btoa(name),
          parentHash: md5(folderContext),
        };
        return newValue;
      });
      setIsSaveButtonActive(true);
      handleScroll(0);
    },
    [folderContext]
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
      // Update url in tagged persons
      updatePersonUrls(urlHash, prevTaggedPersons, newTaggedPersons);
      // Update urlList with new values
      setUrlList((prev) => {
        const newValue = { ...prev };
        newValue[urlHash] = getEncryptedBookmark({
          url,
          title,
          taggedPersons: [...newTaggedPersons],
          parentHash: newFolderHash,
        });
        return newValue;
      });
      // Update folders and current context folder content based on dir change
      if (isFolderChange) {
        setFolders((prev) => {
          const newValue = { ...prev };
          newValue[newFolderHash] = newValue[newFolderHash] || []; // to handle empty folders
          newValue[newFolderHash].push({ isDir, hash: urlHash });
          return newValue;
        });
        setContextBookmarks((prev) => {
          const newValue = [...prev];
          newValue.splice(pos, 1);
          return newValue;
        });
      } else {
        setContextBookmarks((prev) => {
          const newValue = [...prev];
          newValue[pos] = {
            url,
            title,
            taggedPersons: newTaggedPersons,
            isDir,
          };
          return newValue;
        });
      }
      // Add bookmark favicon in the cache
      addToCache(CACHE_BUCKET_KEYS.favicon, getFaviconProxyUrl(url));
      setIsSaveButtonActive(true);
    },
    [updatePersonUrls]
  );

  const handleUrlRemove = useCallback(
    (pos: number, url: string) => {
      const urlHash = md5(url);
      const contextBookmark = contextBookmarks[pos];
      if (contextBookmark.isDir) {
        throw new Error(`Item at pos: ${pos} not a bookmark`);
      }
      // Update url in tagged persons
      updatePersonUrls(urlHash, contextBookmark.taggedPersons, []);
      // Remove from current context folder
      setContextBookmarks((prev) => {
        const newValue = [...prev];
        newValue.splice(pos, 1);
        return newValue;
      });
      // Remove from all urls list
      setUrlList((prev) => {
        const newUrlList = { ...prev };
        delete newUrlList[urlHash];
        return newUrlList;
      });
      setIsSaveButtonActive(true);
      setSelectedBookmarks([]);
    },
    [contextBookmarks, updatePersonUrls]
  );

  const handleBulkUrlRemove = useCallback(() => {
    const newUrlList = { ...urlList };
    const taggedPersonData: IUpdateTaggedPerson[] = [];
    // Remove from current context folder
    setContextBookmarks((prev) => {
      const filteredContextBookmarks = prev.filter((bookmark, index) => {
        if (selectedBookmarks[index] && !bookmark.isDir) {
          const urlHash = md5(bookmark.url);
          // Update url in tagged persons
          taggedPersonData.push({
            prevTaggedPersons: bookmark.taggedPersons || [],
            newTaggedPersons: [],
            urlHash,
          });
          // Remove from all urls list
          delete newUrlList[urlHash];
          return false;
        }
        return true;
      });
      return filteredContextBookmarks;
    });
    setUpdateTaggedPersons(taggedPersonData);
    setUrlList(newUrlList);
    setIsSaveButtonActive(true);
    setSelectedBookmarks([]);
  }, [selectedBookmarks, urlList]);

  const handleFolderEdit = useCallback(
    (oldName: string, newName: string, pos: number) => {
      const oldFolderHash = md5(oldName);
      const newFolderHash = md5(newName);
      // Update parentHash in urlList
      setUrlList((prev) =>
        Object.entries(prev).reduce<IBookmarksObj['urlList']>(
          (obj, [hash, data]) => {
            if (data.parentHash === oldFolderHash) {
              obj[hash] = { ...data, parentHash: newFolderHash };
            } else {
              obj[hash] = data;
            }
            return obj;
          },
          {}
        )
      );
      // Update name in folderList
      setFolderList((prev) => {
        const newValue = { ...prev };
        newValue[newFolderHash] = {
          ...newValue[oldFolderHash],
          name: btoa(newName),
        };
        delete newValue[oldFolderHash];
        return newValue;
      });
      // Update in folders
      setFolders((prev) => {
        const newValue = { ...prev };
        newValue[newFolderHash] = newValue[oldFolderHash];
        delete newValue[oldFolderHash];
        return newValue;
      });
      // Update current folder
      setContextBookmarks((prev) => {
        const newValue = [...prev];
        const curFolder = newValue[pos];
        if (!curFolder.isDir) {
          throw new Error(`Item at pos: ${pos} not a folder`);
        }
        newValue[pos] = { ...curFolder, name: newName };
        return newValue;
      });
      setIsSaveButtonActive(true);
    },
    []
  );

  const handleFolderRemove = useCallback(
    (pos: number, name: string) => {
      const folderHash = md5(name);
      if (isFolderContainsDir(folders, folderHash)) {
        displayToast({
          message: 'Remove inner folders first.',
          severity: 'error',
        });
        return;
      }
      // Remove from current context folder
      setContextBookmarks((prev) => {
        const newValue = [...prev];
        newValue.splice(pos, 1);
        return newValue;
      });
      // Remove from all folders list
      setFolderList((prev) => {
        const newValue = { ...prev };
        delete newValue[folderHash];
        return newValue;
      });
      // Remove all urls inside the folder and update all urls in tagged persons
      const taggedPersonData: IUpdateTaggedPerson[] = [];
      setUrlList((prev) =>
        Object.entries(prev).reduce<IBookmarksObj['urlList']>(
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
        )
      );
      // Remove its data from folders
      setFolders((prev) => {
        const newValue = { ...prev };
        delete newValue[folderHash];
        return newValue;
      });
      setUpdateTaggedPersons([...updateTaggedPersons, ...taggedPersonData]);
      setIsSaveButtonActive(true);
    },
    [displayToast, folders, updateTaggedPersons]
  );

  const handleSave = useCallback(async () => {
    setIsFetching(true);
    // Update url in tagged persons
    updateTaggedPersonUrls(updateTaggedPersons);
    // Form folders obj for current context folder
    const newFolders = { ...folders };
    newFolders[md5(folderContext)] = contextBookmarks.map((x) => ({
      isDir: x.isDir,
      hash: md5(getBookmarkId(x)),
    }));
    const bookmarksObj: IBookmarksObj = {
      folderList,
      urlList,
      folders: newFolders,
    };
    await setBookmarksInStorage(bookmarksObj);
    await initBookmarksData();
    setIsFetching(false);
    setIsSaveButtonActive(false);
    displayToast({
      message: 'Saved temporarily',
      duration: 1500,
    });
  }, [
    contextBookmarks,
    displayToast,
    folderContext,
    folderList,
    folders,
    initBookmarksData,
    updateTaggedPersonUrls,
    updateTaggedPersons,
    urlList,
  ]);

  const handleMoveBookmarks = useCallback((destinationIndex: number) => {
    setSelectedBookmarks((prevSelectedBookmarks) => {
      const destIndex = getDestinationIndex(
        destinationIndex,
        prevSelectedBookmarks
      );
      setContextBookmarks((prevContextBookmarks) =>
        getBookmarksAfterDrag(
          prevContextBookmarks,
          prevSelectedBookmarks,
          destIndex
        )
      );
      return getSelectedBookmarksAfterDrag(
        [...prevSelectedBookmarks],
        destIndex
      );
    });
    setIsSaveButtonActive(true);
  }, []);

  const onDragStart = useCallback<NonNullable<DndContextProps['onDragStart']>>(
    ({ active }) => {
      const index = active.data.current?.sortable?.index;
      setSelectedBookmarks((prev) => {
        const newValue = [...prev];
        const isCurrentDraggingSelected = newValue[index];
        if (!isCurrentDraggingSelected) {
          newValue.fill(false);
          newValue[index] = true;
        }
        return newValue;
      });
      setIsDragging(true);
    },
    []
  );

  const onDragEnd = useCallback<NonNullable<DndContextProps['onDragEnd']>>(
    ({ active, over }) => {
      if (!over || active.id === over.id) {
        return;
      }
      handleMoveBookmarks(over.data.current?.sortable?.index);
      setIsDragging(false);
    },
    [handleMoveBookmarks]
  );

  const folderNamesList = useMemo(
    () => getAllFolderNames(folderList),
    [folderList]
  );
  const filteredContextBookmarks = useMemo(
    () => getFilteredContextBookmarks(contextBookmarks, searchText),
    [contextBookmarks, searchText]
  );
  const curBookmarksCount = filteredContextBookmarks.length;
  const minReqBookmarksToScroll = Math.ceil(bodyHeight / BOOKMARK_ROW_HEIGHT);
  return (
    <>
      <ScrollButton
        itemsSize={curBookmarksCount}
        onScroll={handleScroll}
        minItemsReqToShow={minReqBookmarksToScroll}
      />
      <Flex
        direction="column"
        w={MAX_PANEL_SIZE.WIDTH}
        h={MAX_PANEL_SIZE.HEIGHT}
      >
        <BookmarksHeader
          contextBookmarks={contextBookmarks}
          handleSave={handleSave}
          handleCreateNewFolder={handleCreateNewFolder}
          isSaveButtonActive={isSaveButtonActive}
          isFetching={isFetching}
          onSearchChange={setSearchText}
        />
        <BookmarkAddEditDialog
          curFolder={folderContext}
          onSave={handleBookmarkSave}
          onDelete={handleUrlRemove}
          contextBookmarks={contextBookmarks}
          folderNamesList={folderNamesList}
          handleScroll={handleScroll}
          handleSelectedChange={handleSelectedChange}
        />
        <BookmarkContextMenu
          contextBookmarks={contextBookmarks}
          selectedBookmarks={selectedBookmarks}
          handleBulkUrlRemove={handleBulkUrlRemove}
          handleUrlRemove={handleUrlRemove}
          handleOpenSelectedBookmarks={handleOpenSelectedBookmarks}
          handleMoveBookmarks={handleMoveBookmarks}
          handleScroll={handleScroll}
        >
          <Box ref={bodyRef} h="100%" w="100%">
            {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                // onDragCancel={() => setActiveId(null)}
                // modifiers={modifiers}
              >
                <SortableContext
                  items={filteredContextBookmarks.map(getBookmarkId)}
                  strategy={verticalListSortingStrategy}
                >
                  <FixedSizeList<VirtualRowProps>
                    ref={listRef}
                    height={bodyHeight}
                    width={bodyWidth}
                    itemSize={BOOKMARK_ROW_HEIGHT}
                    itemCount={curBookmarksCount}
                    overscanCount={5}
                    itemKey={(index, data) => {
                      const ctx = data.contextBookmarks[index];
                      return getBookmarkId(ctx);
                    }}
                    itemData={{
                      folderNamesList,
                      folders,
                      selectedBookmarks,
                      contextBookmarks: filteredContextBookmarks,
                      handleFolderRemove,
                      handleFolderEdit,
                      resetSelectedBookmarks,
                      handleSelectedChange,
                    }}
                    style={{ overflow: 'hidden scroll' }}
                  >
                    {VirtualRow}
                  </FixedSizeList>
                </SortableContext>
                {createPortal(
                  <DragOverlay>
                    <DragClone
                      selectedBookmarks={selectedBookmarks}
                      contextBookmarks={contextBookmarks}
                      isDragging={isDragging}
                    />
                  </DragOverlay>,
                  document.body
                )}
              </DndContext>
            ) : null}
          </Box>
        </BookmarkContextMenu>
      </Flex>
    </>
  );
});

export default BookmarksPanel;
