'use client';

import styles from '@/styles/bookmark-panel.module.css';
import VirtualRow from '@/ui/BookmarksPage/components/VirtualRow';
import { getFromLocalStorage, setToLocalStorage } from '@/ui/provider/utils';
import {
  BOOKMARK_ROW_HEIGHT,
  bookmarksMapper,
  ContextBookmarks,
  DEFAULT_BOOKMARK_FOLDER,
  getBookmarkId,
  getFilteredContextBookmarks,
  Header,
  IBookmarksObj,
  shouldRenderBookmarks,
  STORAGE_KEYS,
} from '@bypass/shared';
import { Box, Container } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import md5 from 'md5';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const runtime = 'edge';

export default function BookmarksPage() {
  const searchParams = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const folderContext =
    searchParams?.get('folderContext') ?? DEFAULT_BOOKMARK_FOLDER;
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
    getScrollElement: () => contentRef.current,
    getItemKey: (idx) => getBookmarkId(filteredContextBookmarks[idx]),
  });

  const initBookmarksData = useCallback(async () => {
    const bookmarksData = await getFromLocalStorage<IBookmarksObj>(
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
    const folderContextHash = md5(folderContext);
    const modifiedBookmarks = Object.entries(
      foldersData[folderContextHash]
    ).map((kvp) => bookmarksMapper(kvp, urlListData, folderListData));
    setContextBookmarks(modifiedBookmarks);
    setFolders(foldersData);
    setToLocalStorage(STORAGE_KEYS.bookmarks, bookmarksData);
  }, [folderContext]);

  useEffect(() => {
    initBookmarksData();
  }, [initBookmarksData]);

  const handleSearchTextChange = (text: string) => setSearchText(text);

  return (
    <Container size="md" h="100vh" px={0} className={styles.container}>
      <Header
        onSearchChange={handleSearchTextChange}
        text={`${folderContext} (${contextBookmarks?.length || 0})`}
      />
      <Box ref={contentRef} className={styles.innerContainer}>
        {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
          <Box h={virtualizer.getTotalSize()} w="100%" pos="relative">
            {virtualizer.getVirtualItems().map((virtualRow) => (
              <Box
                key={virtualRow.key}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
                pos="absolute"
                top={0}
                left={0}
                w="100%"
                h={virtualRow.size}
              >
                <VirtualRow
                  index={virtualRow.index}
                  folders={folders}
                  contextBookmarks={filteredContextBookmarks}
                />
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </Container>
  );
}
