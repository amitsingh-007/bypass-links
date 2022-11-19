import {
  ContextBookmarks,
  IBookmarksObj,
} from '@common/components/Bookmarks/interfaces';
import { bookmarksMapper } from '@common/components/Bookmarks/mapper';
import { defaultBookmarkFolder } from '@common/components/Bookmarks/constants';
import { useCallback, useEffect, useState } from 'react';
import md5 from 'md5';
import { FixedSizeList } from 'react-window';
import VirtualRow, {
  VirtualRowProps,
} from '@/ui/BookmarksPage/components/VirtualRow';
import { useRouter } from 'next/router';
import { Container } from '@mui/material';
import { STORAGE_KEYS } from '@common/constants/storage';
import { getFromLocalStorage, setToLocalStorage } from '@/ui/provider/utils';
import MetaTags from '@/ui/components/MetaTags';
import Header, { HEADER_HEIGHT } from '@/ui/components/Header';
import {
  getFilteredContextBookmarks,
  shouldRenderBookmarks,
} from '@common/components/Bookmarks/utils';
import { useWindowSize } from 'react-use';

export default function BookmarksPage() {
  const router = useRouter();
  const { height: WINDOW_HEIGHT } = useWindowSize();
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

  const filteredContextBookmarks = getFilteredContextBookmarks(
    contextBookmarks,
    searchText
  );
  const curBookmarksCount = filteredContextBookmarks.length;

  return (
    <Container maxWidth="md">
      <MetaTags titleSuffix="Bookmarks Panel" />
      <Header
        title={`${folderContext} (${contextBookmarks?.length || 0})`}
        onSearchChange={handleSearchTextChange}
      />
      {shouldRenderBookmarks(folders, filteredContextBookmarks) ? (
        <FixedSizeList<VirtualRowProps>
          height={WINDOW_HEIGHT - HEADER_HEIGHT}
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
    </Container>
  );
}
