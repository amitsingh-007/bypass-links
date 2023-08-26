import VirtualRow, {
  VirtualRowProps,
} from '@/ui/BookmarksPage/components/VirtualRow';
import { getFromLocalStorage, setToLocalStorage } from '@/ui/provider/utils';
import {
  bookmarksMapper,
  ContextBookmarks,
  defaultBookmarkFolder,
  getBookmarkId,
  getFilteredContextBookmarks,
  Header,
  IBookmarksObj,
  shouldRenderBookmarks,
  STORAGE_KEYS,
} from '@bypass/shared';
import { Box, Container } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import md5 from 'md5';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FixedSizeList } from 'react-window';

export default function BookmarksPage() {
  const router = useRouter();
  const { ref: contentRef, height: contentHeight } = useElementSize();
  const folderContext =
    (router.query.folderContext as string) ?? defaultBookmarkFolder;
  const [contextBookmarks, setContextBookmarks] = useState<ContextBookmarks>(
    []
  );
  const [folders, setFolders] = useState<IBookmarksObj['folders']>({});
  const [searchText, setSearchText] = useState('');

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

  const filteredContextBookmarks = useMemo(
    () => getFilteredContextBookmarks(contextBookmarks, searchText),
    [contextBookmarks, searchText]
  );
  const curBookmarksCount = filteredContextBookmarks.length;

  return (
    <Container
      size="md"
      h="100vh"
      px={0}
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      <NextSeo title="Bookmarks Panel" noindex nofollow />
      <Header
        onSearchChange={handleSearchTextChange}
        text={`${folderContext} (${contextBookmarks?.length || 0})`}
      />
      <Box ref={contentRef} sx={{ flex: 1 }}>
        {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
          <FixedSizeList<VirtualRowProps>
            height={contentHeight}
            width="100%"
            itemSize={31}
            itemCount={curBookmarksCount}
            overscanCount={10}
            itemKey={(index, data) => {
              const ctx = data.contextBookmarks[index];
              return getBookmarkId(ctx);
            }}
            itemData={{
              folders,
              contextBookmarks: filteredContextBookmarks,
            }}
          >
            {VirtualRow}
          </FixedSizeList>
        ) : null}
      </Box>
    </Container>
  );
}
