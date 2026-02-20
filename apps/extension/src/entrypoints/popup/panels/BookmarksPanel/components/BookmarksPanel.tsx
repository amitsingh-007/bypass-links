import {
  type BMPanelQueryParams,
  BOOKMARK_ROW_HEIGHT,
  EBookmarkOperation,
  HEADER_HEIGHT,
  ScrollButton,
  getFilteredContextBookmarks,
  shouldRenderBookmarks,
} from '@bypass/shared';
import { ScrollArea } from '@bypass/ui';
import useHistoryStore from '@store/history';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useBookmarkRouteStore from '../store/useBookmarkRouteStore';
import useBookmarkStore from '../store/useBookmarkStore';
import BookmarkAddEditDialog from './BookmarkAddEditDialog';
import BookmarkContextMenu from './BookmarkContextMenu';
import BookmarksHeader from './BookmarksHeader';
import VirtualRow from './VirtualRow';
import { MAX_PANEL_SIZE } from '@/constants';

function BookmarksPanel({ folderId, operation, bmUrl }: BMPanelQueryParams) {
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
    cutBookmarks,
    isFetching,
    loadData,
  } = useBookmarkStore(
    useShallow((state) => ({
      contextBookmarks: state.contextBookmarks,
      folders: state.folders,
      selectedBookmarks: state.selectedBookmarks,
      cutBookmarks: state.cutBookmarks,
      isFetching: state.isFetching,
      loadData: state.loadData,
    }))
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const filteredContextBookmarks = useMemo(
    () => getFilteredContextBookmarks(contextBookmarks, searchText),
    [contextBookmarks, searchText]
  );
  const virtualizer = useVirtualizer({
    count: filteredContextBookmarks.length,
    estimateSize: () => BOOKMARK_ROW_HEIGHT,
    overscan: 5,
    getScrollElement: () => scrollAreaRef.current,
    getItemKey: (idx) => filteredContextBookmarks[idx].id,
  });

  const handleScroll = (itemNumber: number) =>
    virtualizer.scrollToIndex(itemNumber);

  const handleOpenSelectedBookmarks = useCallback(() => {
    startHistoryMonitor();
    contextBookmarks.forEach((bookmark, index) => {
      if (selectedBookmarks[index] && !bookmark.isDir) {
        browser.tabs.create({ url: bookmark.url, active: false });
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
    loadData(folderId);
  }, [folderId, loadData]);

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

  return (
    <>
      <ScrollButton itemsSize={curBookmarksCount} onScroll={handleScroll} />
      <div
        className="flex flex-col"
        style={{ width: MAX_PANEL_SIZE.WIDTH, height: MAX_PANEL_SIZE.HEIGHT }}
      >
        <BookmarksHeader folderId={folderId} onSearchChange={setSearchText} />
        <BookmarkAddEditDialog
          curFolderId={folderId}
          handleScroll={handleScroll}
        />
        <BookmarkContextMenu
          handleOpenSelectedBookmarks={handleOpenSelectedBookmarks}
        >
          <ScrollArea
            viewportRef={scrollAreaRef}
            className="w-full"
            style={{ height: MAX_PANEL_SIZE.HEIGHT - HEADER_HEIGHT }}
          >
            {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
              <div
                className="relative w-full"
                style={{ height: virtualizer.getTotalSize() }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => (
                  <div
                    key={virtualRow.key}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      height: virtualRow.size,
                    }}
                  >
                    <VirtualRow
                      bookmark={filteredContextBookmarks[virtualRow.index]}
                      pos={virtualRow.index}
                      isSelected={selectedBookmarks[virtualRow.index]}
                      isCut={cutBookmarks[virtualRow.index]}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </ScrollArea>
        </BookmarkContextMenu>
      </div>
    </>
  );
}

export default BookmarksPanel;
