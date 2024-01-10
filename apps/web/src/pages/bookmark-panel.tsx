import VirtualRow from '@/ui/BookmarksPage/components/VirtualRow';
import { getFromLocalStorage, setToLocalStorage } from '@/ui/provider/utils';
import {
  BOOKMARK_ROW_HEIGHT,
  ContextBookmarks,
  Header,
  IBookmarksObj,
  STORAGE_KEYS,
  bookmarksMapper,
  DEFAULT_BOOKMARK_FOLDER,
  getBookmarkId,
  getFilteredContextBookmarks,
  shouldRenderBookmarks,
} from '@bypass/shared';
import { Box, Container } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import md5 from 'md5';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/bookmark-panel.module.css';

export default function BookmarksPage() {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const folderContext =
    (router.query.folderContext as string) ?? DEFAULT_BOOKMARK_FOLDER;
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
      <NextSeo title="Bookmarks Panel" noindex nofollow />
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
