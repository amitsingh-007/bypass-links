import { MAX_PANEL_SIZE } from '@/constants';
import {
  BMPanelQueryParams,
  BOOKMARK_OPERATION,
  BOOKMARK_ROW_HEIGHT,
  CACHE_BUCKET_KEYS,
  ContextBookmarks,
  HEADER_HEIGHT,
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
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getBookmarks } from '@helpers/fetchFromStorage';
import { Box, Flex } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import useBookmarkStore from '@store/bookmark';
import useHistoryStore from '@store/history';
import usePersonStore from '@store/person';
import useToastStore from '@store/toast';
import { useVirtualizer } from '@tanstack/react-virtual';
import md5 from 'md5';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useBookmarkDrag from '../hooks/useBookmarkDrag';
import { isFolderContainsDir, setBookmarksInStorage } from '../utils';
import {
  getBookmarksAfterDrag,
  getDestinationIndex,
  getSelectedBookmarksAfterDrag,
} from '../utils/manipulate';
import BookmarkAddEditDialog from './BookmarkAddEditDialog';
import BookmarkContextMenu from './BookmarkContextMenu';
import BookmarksHeader from './BookmarksHeader';
import DragClone from './DragClone';
import VirtualRow from './VirtualRow';

const BookmarksPanel = memo<BMPanelQueryParams>(function BookmarksPanel({
  folderContext,
  operation,
  bmUrl,
}) {
  const { ref: bodyRef, height: bodyHeight } = useElementSize();
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
  const filteredContextBookmarks = useMemo(
    () => getFilteredContextBookmarks(contextBookmarks, searchText),
    [contextBookmarks, searchText]
  );
  const virtualizer = useVirtualizer({
    count: filteredContextBookmarks.length,
    estimateSize: () => BOOKMARK_ROW_HEIGHT,
    overscan: 5,
    getScrollElement: () => bodyRef.current,
    getItemKey: (idx) => getBookmarkId(filteredContextBookmarks[idx]),
  });

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
    virtualizer.scrollToIndex(itemNumber, { behavior: 'smooth' });

  useEffect(() => {
    initBookmarksData();
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
        newValue.unshift({ isDir, name, isDefault: false });
        return newValue;
      });
      // Update data in all folders list
      setFolderList((prev) => {
        const newValue = { ...prev };
        newValue[nameHash] = {
          name: btoa(name),
          parentHash: md5(folderContext),
          isDefault: false,
        };
        return newValue;
      });
      setIsSaveButtonActive(true);
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
      const filteredBookmarks = prev.filter((bookmark, index) => {
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
      return filteredBookmarks;
    });
    setUpdateTaggedPersons(taggedPersonData);
    setUrlList(newUrlList);
    setIsSaveButtonActive(true);
    setSelectedBookmarks([]);
  }, [selectedBookmarks, urlList]);

  const handleFolderRename = useCallback(
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

  const handleToggleDefaultFolder = useCallback(
    (folderName: string, newIsDefault: boolean) => {
      // TODO: handle toggle
      if (newIsDefault) {
        setFolderList((prev) => {
          const folderHash = md5(folderName);
          const newValue = { ...prev };
          newValue[folderHash] = {
            ...newValue[folderHash],
            isDefault: newIsDefault,
          };
          return newValue;
        });
      }
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

  const { sensors, isDragging, onDragStart, onDragEnd, onDragCancel } =
    useBookmarkDrag({
      setSelectedBookmarks,
      handleMoveBookmarks,
    });
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
          folderList={folderList}
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
          <Box
            ref={bodyRef}
            h={MAX_PANEL_SIZE.HEIGHT - HEADER_HEIGHT}
            w="100%"
            sx={{ overflow: 'hidden scroll' }}
          >
            {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragCancel={onDragCancel}
              >
                <SortableContext
                  items={filteredContextBookmarks.map(getBookmarkId)}
                  strategy={verticalListSortingStrategy}
                  disabled={!!searchText}
                >
                  <Box h={virtualizer.getTotalSize()} w="100%" pos="relative">
                    {virtualizer.getVirtualItems().map((virtualRow) => (
                      <Box
                        key={virtualRow.key}
                        sx={{ transform: `translateY(${virtualRow.start}px)` }}
                        pos="absolute"
                        top={0}
                        left={0}
                        w="100%"
                        h={virtualRow.size}
                      >
                        <VirtualRow
                          bookmark={filteredContextBookmarks[virtualRow.index]}
                          pos={virtualRow.index}
                          isSelected={selectedBookmarks[virtualRow.index]}
                          folders={folders}
                          handleFolderRemove={handleFolderRemove}
                          handleFolderEdit={handleFolderRename}
                          toggleDefaultFolder={handleToggleDefaultFolder}
                          resetSelectedBookmarks={resetSelectedBookmarks}
                          handleSelectedChange={handleSelectedChange}
                        />
                      </Box>
                    ))}
                  </Box>
                </SortableContext>
                <DragOverlay>
                  {isDragging && (
                    <DragClone
                      selectedBookmarks={selectedBookmarks}
                      contextBookmarks={contextBookmarks}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            ) : null}
          </Box>
        </BookmarkContextMenu>
      </Flex>
    </>
  );
});

export default BookmarksPanel;
