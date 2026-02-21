'use client';

import { getFromLocalStorage, setToLocalStorage } from '@app/utils/storage';
import {
  BOOKMARK_ROW_HEIGHT,
  bookmarksMapper,
  type ContextBookmarks,
  ROOT_FOLDER_ID,
  getFilteredContextBookmarks,
  getFolderName,
  Header,
  type IBookmarksObj,
  shouldRenderBookmarks,
  STORAGE_KEYS,
} from '@bypass/shared';
import { ScrollArea } from '@bypass/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VirtualRow from './components/VirtualRow';

export default function BookmarksPage() {
  const searchParams = useSearchParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const folderId = searchParams?.get('folderId') ?? ROOT_FOLDER_ID;
  const [folderName, setFolderName] = useState('');
  const [contextBookmarks, setContextBookmarks] = useState<ContextBookmarks>(
    []
  );
  const [folders, setFolders] = useState<IBookmarksObj['folders']>({});
  const [searchText, setSearchText] = useState('');
  const filteredContextBookmarks = useMemo(
    () => getFilteredContextBookmarks(contextBookmarks, searchText),
    [contextBookmarks, searchText]
  );
  const virtualizer = useVirtualizer({
    count: filteredContextBookmarks.length,
    estimateSize: () => BOOKMARK_ROW_HEIGHT,
    overscan: 10,
    getScrollElement: () => scrollAreaRef.current,
    getItemKey: (idx) => filteredContextBookmarks[idx].id,
  });

  const initBookmarksData = useCallback(() => {
    const bookmarksData = getFromLocalStorage<IBookmarksObj>(
      STORAGE_KEYS.bookmarks
    );
    if (!bookmarksData) {
      return;
    }
    const {
      folders: foldersData,
      urlList: urlListData,
      folderList: folderListData,
    } = bookmarksData;
    const modifiedBookmarks = Object.entries(foldersData[folderId]).map((kvp) =>
      bookmarksMapper(kvp, urlListData, folderListData)
    );
    setContextBookmarks(modifiedBookmarks);
    setFolders(foldersData);
    setFolderName(getFolderName(folderListData, folderId));
    setToLocalStorage(STORAGE_KEYS.bookmarks, bookmarksData);
  }, [folderId]);

  useEffect(() => {
    initBookmarksData();
  }, [initBookmarksData]);

  const handleSearchTextChange = (text: string) => setSearchText(text);

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-0">
      <Header
        text={`${folderName} (${contextBookmarks?.length || 0})`}
        onSearchChange={handleSearchTextChange}
      />
      <ScrollArea viewportRef={scrollAreaRef} className="flex-1">
        {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
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
                  index={virtualRow.index}
                  folders={folders}
                  contextBookmarks={filteredContextBookmarks}
                />
              </div>
            ))}
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
}
