import { MAX_PANEL_SIZE } from '@/constants';
import useBookmarkRouteStore from '@/BookmarksPanel/store/useBookmarkRouteStore';
import {
  BMPanelQueryParams,
  BOOKMARK_ROW_HEIGHT,
  EBookmarkOperation,
  HEADER_HEIGHT,
  ScrollButton,
  getBookmarkId,
  getFilteredContextBookmarks,
  shouldRenderBookmarks,
} from '@bypass/shared';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Flex } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import useHistoryStore from '@store/history';
import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useBookmarkDrag from '../hooks/useBookmarkDrag';
import useBookmarkStore from '../store/useBookmarkStore';
import BookmarkAddEditDialog from './BookmarkAddEditDialog';
import BookmarkContextMenu from './BookmarkContextMenu';
import BookmarksHeader from './BookmarksHeader';
import DragClone from './DragClone';
import VirtualRow from './VirtualRow';
import styles from './styles/BookmarksPanel.module.css';

const BookmarksPanel = memo<BMPanelQueryParams>(
  ({ folderContext, operation, bmUrl }) => {
    const { ref: bodyRef, height: bodyHeight } = useElementSize();
    const startHistoryMonitor = useHistoryStore(
      (state) => state.startHistoryMonitor
    );
    const setBookmarkOperation = useBookmarkRouteStore(
      (state) => state.setBookmarkOperation
    );
    const {
      contextBookmarks,
      folders,
      selectedBookmarks,
      isFetching,
      loadData,
    } = useBookmarkStore(
      useShallow((state) => ({
        contextBookmarks: state.contextBookmarks,
        folders: state.folders,
        selectedBookmarks: state.selectedBookmarks,
        isFetching: state.isFetching,
        loadData: state.loadData,
      }))
    );
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
    const { sensors, isDragging, onDragStart, onDragEnd, onDragCancel } =
      useBookmarkDrag();

    const handleScroll = (itemNumber: number) =>
      virtualizer.scrollToIndex(itemNumber);

    const handleOpenSelectedBookmarks = useCallback(() => {
      startHistoryMonitor();
      contextBookmarks.forEach((bookmark, index) => {
        if (selectedBookmarks[index] && !bookmark.isDir) {
          chrome.tabs.create({ url: bookmark.url, active: false });
        }
      });
    }, [contextBookmarks, selectedBookmarks, startHistoryMonitor]);

    // Reset scroll on folder change
    useEffect(() => {
      if (!isFetching) {
        handleScroll(0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetching]);

    useEffect(() => {
      loadData(folderContext);
    }, [folderContext, loadData]);

    useEffect(() => {
      if (!isFetching && operation !== EBookmarkOperation.NONE) {
        /**
         * Need to call after loadData,
         * Since EditBookmark internally needs contextBookmarks to be set beforehand
         */
        setBookmarkOperation(operation, bmUrl);
      }
    }, [bmUrl, isFetching, operation, setBookmarkOperation]);

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
            onSearchChange={setSearchText}
            folderContext={folderContext}
          />
          <BookmarkAddEditDialog
            curFolder={folderContext}
            handleScroll={handleScroll}
          />
          <BookmarkContextMenu
            handleOpenSelectedBookmarks={handleOpenSelectedBookmarks}
            handleScroll={handleScroll}
          >
            <Box
              ref={bodyRef}
              h={MAX_PANEL_SIZE.HEIGHT - HEADER_HEIGHT}
              w="100%"
              className={styles.body}
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
                    items={filteredContextBookmarks.map((x) =>
                      getBookmarkId(x)
                    )}
                    strategy={verticalListSortingStrategy}
                    disabled={!!searchText}
                  >
                    <Box h={virtualizer.getTotalSize()} w="100%" pos="relative">
                      {virtualizer.getVirtualItems().map((virtualRow) => (
                        <Box
                          key={virtualRow.key}
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          pos="absolute"
                          top={0}
                          left={0}
                          w="100%"
                          h={virtualRow.size}
                        >
                          <VirtualRow
                            bookmark={
                              filteredContextBookmarks[virtualRow.index]
                            }
                            pos={virtualRow.index}
                            isSelected={selectedBookmarks[virtualRow.index]}
                          />
                        </Box>
                      ))}
                    </Box>
                  </SortableContext>
                  <DragOverlay>{isDragging && <DragClone />}</DragOverlay>
                </DndContext>
              ) : null}
            </Box>
          </BookmarkContextMenu>
        </Flex>
      </>
    );
  }
);
BookmarksPanel.displayName = 'BookmarksPanel';

export default BookmarksPanel;
