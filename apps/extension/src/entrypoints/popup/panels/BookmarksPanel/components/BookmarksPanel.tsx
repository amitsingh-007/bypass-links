import {
  BOOKMARK_ROW_HEIGHT,
  DynamicContext,
  HEADER_HEIGHT,
  ScrollButton,
  getFilteredContextBookmarks,
} from '@bypass/shared';
import { ScrollArea } from '@bypass/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { use, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { MAX_PANEL_SIZE } from '@/constants';
import Panel from '@popup/components/Panel';

import useBookmarkPanelParams from '../hooks/useBookmarkPanelParams';
import useBookmarkStore from '../store/useBookmarkStore';
import { findBookmarkById } from '../utils/bookmark';
import BookmarkAddEditDialog from './BookmarkAddEditDialog';
import BookmarkContextMenu from './BookmarkContextMenu';
import BookmarksHeader from './BookmarksHeader';
import VirtualRow from './VirtualRow';

function BookmarksPanel() {
  const { folderId } = useBookmarkPanelParams();
  const { tabs } = use(DynamicContext);
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
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: filteredContextBookmarks.length,
    estimateSize: () => BOOKMARK_ROW_HEIGHT,
    overscan: 5,
    getScrollElement: () => scrollAreaRef.current,
    getItemKey: (idx) => filteredContextBookmarks[idx].id,
  });

  // Right-clicked row wins over the selection, which anything can clear mid-gesture
  const handleOpenBookmarks = (id: string) => {
    const { selectedBookmarks: selected } = useBookmarkStore.getState();
    const rightClicked = findBookmarkById(filteredContextBookmarks, id);

    if (rightClicked && selected.size < 2) {
      tabs.open(rightClicked.url);
      return;
    }

    // Visible rows only: a selection can outlive the filter that hid it
    filteredContextBookmarks.forEach((bookmark) => {
      if (!bookmark.isDir && selected.has(bookmark.id)) {
        tabs.open(bookmark.url);
      }
    });
  };

  useEffect(() => {
    if (!isFetching) {
      virtualizer.scrollToIndex(0);
    }
  }, [isFetching, virtualizer]);

  useEffect(() => {
    if (folderId) {
      loadData(folderId);
    }
  }, [folderId, loadData]);

  const curBookmarksCount = filteredContextBookmarks.length;

  return (
    <Panel>
      <ScrollButton
        itemsSize={curBookmarksCount}
        onScroll={virtualizer.scrollToIndex}
      />
      <BookmarksHeader folderId={folderId} onSearchChange={setSearchText} />
      <BookmarkAddEditDialog
        curFolderId={folderId}
        handleScroll={virtualizer.scrollToIndex}
      />
      <BookmarkContextMenu handleOpenBookmarks={handleOpenBookmarks}>
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
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const bookmark = filteredContextBookmarks[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      height: virtualRow.size,
                    }}
                  >
                    <VirtualRow
                      bookmark={bookmark}
                      isSelected={selectedBookmarks.has(bookmark.id)}
                      isCut={cutBookmarks.has(bookmark.id)}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </ScrollArea>
      </BookmarkContextMenu>
    </Panel>
  );
}

export default BookmarksPanel;
