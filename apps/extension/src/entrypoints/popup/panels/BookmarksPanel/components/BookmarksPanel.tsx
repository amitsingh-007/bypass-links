import {
  type BMPanelQueryParams,
  BOOKMARK_ROW_HEIGHT,
  DynamicContext,
  EBookmarkOperation,
  HEADER_HEIGHT,
  ScrollButton,
  getFilteredContextBookmarks,
} from '@bypass/shared';
import { ScrollArea } from '@bypass/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { MAX_PANEL_SIZE } from '@/constants';
import Panel from '@popup/components/Panel';

import useBookmarkRouteStore from '../store/useBookmarkRouteStore';
import useBookmarkStore from '../store/useBookmarkStore';
import BookmarkAddEditDialog from './BookmarkAddEditDialog';
import BookmarkContextMenu from './BookmarkContextMenu';
import BookmarksHeader from './BookmarksHeader';
import VirtualRow from './VirtualRow';

function BookmarksPanel({ folderId, operation, bmUrl }: BMPanelQueryParams) {
  const { tabs } = use(DynamicContext);
  const setBookmarkOperation = useBookmarkRouteStore(
    (state) => state.setBookmarkOperation
  );
  const {
    contextBookmarks,
    selectedBookmarks,
    cutBookmarks,
    isFetching,
    loadData,
  } = useBookmarkStore(
    useShallow((state) => ({
      contextBookmarks: state.contextBookmarks,
      selectedBookmarks: state.selectedBookmarks,
      cutBookmarks: state.cutBookmarks,
      isFetching: state.isFetching,
      loadData: state.loadData,
    }))
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const filteredContextBookmarks = getFilteredContextBookmarks(
    contextBookmarks,
    searchText
  );
  const virtualizer = useVirtualizer({
    count: filteredContextBookmarks.length,
    estimateSize: () => BOOKMARK_ROW_HEIGHT,
    overscan: 5,
    getScrollElement: () => scrollAreaRef.current,
    getItemKey: (idx) => filteredContextBookmarks[idx].id,
  });

  // Kept memoized: it is a dep of an effect below, so an unstable identity
  // would re-run that effect on every render
  const handleScroll = useCallback(
    (itemNumber: number) => virtualizer.scrollToIndex(itemNumber),
    [virtualizer]
  );

  const handleOpenSelectedBookmarks = () => {
    contextBookmarks.forEach((bookmark, index) => {
      if (selectedBookmarks[index] && !bookmark.isDir) {
        tabs.open(bookmark.url);
      }
    });
  };

  // Reset scroll on folder change
  useEffect(() => {
    if (!isFetching) {
      handleScroll(0);
    }
  }, [isFetching, handleScroll]);

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
    <Panel>
      <ScrollButton itemsSize={curBookmarksCount} onScroll={handleScroll} />
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
          {filteredContextBookmarks.length > 0 ? (
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
    </Panel>
  );
}

export default BookmarksPanel;
