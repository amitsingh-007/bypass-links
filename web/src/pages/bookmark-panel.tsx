import VirtualRow, {
  VirtualRowProps,
} from '@/ui/BookmarksPage/components/VirtualRow';
import MetaTags from '@/ui/components/MetaTags';
import { getFromLocalStorage, setToLocalStorage } from '@/ui/provider/utils';
import { defaultBookmarkFolder } from '@bypass/shared/components/Bookmarks/constants';
import {
  ContextBookmarks,
  IBookmarksObj,
} from '@bypass/shared/components/Bookmarks/interfaces';
import { bookmarksMapper } from '@bypass/shared/components/Bookmarks/mapper';
import {
  getFilteredContextBookmarks,
  shouldRenderBookmarks,
} from '@bypass/shared/components/Bookmarks/utils';
import Header from '@bypass/shared/components/Header';
import { STORAGE_KEYS } from '@bypass/shared/constants/storage';
import { Box, Container } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import md5 from 'md5';
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
    const { folders, urlList, folderList } = bookmarksData;
    const folderContextHash = md5(folderContext);
    const modifiedBookmarks = Object.entries(folders[folderContextHash]).map(
      (kvp) => bookmarksMapper(kvp, urlList, folderList)
    );
    setContextBookmarks(modifiedBookmarks);
    setFolders(folders);
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
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      <MetaTags titleSuffix="Bookmarks Panel" />
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
              const { isDir, url, name } = data.contextBookmarks[index];
              return (isDir ? name : url) ?? '';
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
