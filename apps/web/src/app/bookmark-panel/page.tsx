'use client';

import {
  BOOKMARK_ROW_HEIGHT,
  bookmarksMapper,
  type ContextBookmarks,
  ROOT_FOLDER_ID,
  getFilteredContextBookmarks,
  getFolderName,
  Header,
  type IBookmarksObj,
  STORAGE_KEYS,
  swrKeys,
} from '@bypass/shared';
import { ScrollArea } from '@bypass/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import useSWR from 'swr';

import { getFromLocalStorage } from '@app/utils/storage';

import VirtualRow from './components/VirtualRow';

const fetchBookmarks = () =>
  getFromLocalStorage<IBookmarksObj>(STORAGE_KEYS.bookmarks);

export default function BookmarksPage() {
  const searchParams = useSearchParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const folderId = searchParams?.get('folderId') ?? ROOT_FOLDER_ID;
  const [searchText, setSearchText] = useState('');

  const { data: bookmarksData } = useSWR(swrKeys.bookmarks, fetchBookmarks);

  const folders = bookmarksData?.folders ?? {};
  // `?? []`: this runs in the render body, so a stale folderId would crash the tree
  const contextBookmarks: ContextBookmarks = bookmarksData
    ? (bookmarksData.folders[folderId] ?? []).map((meta) =>
        bookmarksMapper(meta, bookmarksData.urlList, bookmarksData.folderList)
      )
    : [];
  const folderName = bookmarksData
    ? getFolderName(bookmarksData.folderList, folderId)
    : '';
  const filteredContextBookmarks = getFilteredContextBookmarks(
    contextBookmarks,
    searchText
  );
  const virtualizer = useVirtualizer({
    count: filteredContextBookmarks.length,
    estimateSize: () => BOOKMARK_ROW_HEIGHT,
    overscan: 10,
    getScrollElement: () => scrollAreaRef.current,
    getItemKey: (idx) => filteredContextBookmarks[idx].id,
  });

  return (
    <div className="max-w-panel mx-auto flex h-screen flex-col px-0">
      <Header
        text={`${folderName} (${contextBookmarks?.length || 0})`}
        onSearchChange={setSearchText}
      />
      <ScrollArea viewportRef={scrollAreaRef} className="flex-1">
        {filteredContextBookmarks.length > 0 ? (
          <div
            style={{ height: virtualizer.getTotalSize() }}
            className="relative w-full"
          >
            {virtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.key}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  height: virtualRow.size,
                }}
                className="absolute top-0 left-0 w-full"
              >
                <VirtualRow
                  bookmark={filteredContextBookmarks[virtualRow.index]}
                  folders={folders}
                />
              </div>
            ))}
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
}
