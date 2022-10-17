import { useFirebaseQuery } from '@/ui/api';
import { FIREBASE_DB_REF } from '@common/constants/firebase';
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
import { useWindowHeight } from '@react-hook/window-size';
import { Container } from '@mui/material';

export default function BookmarksPage() {
  const router = useRouter();
  const height = useWindowHeight();
  const folderContext =
    (router.query.folderContext as string) ?? defaultBookmarkFolder;
  const { data, isLoading } = useFirebaseQuery.useFirebaseDb<IBookmarksObj>(
    FIREBASE_DB_REF.bookmarks
  );
  const [isIniting, setIsIniting] = useState(true);
  const [contextBookmarks, setContextBookmarks] = useState<ContextBookmarks>(
    []
  );
  // const [urlList, setUrlList] = useState<IBookmarksObj['urlList']>({});
  // const [folderList, setFolderList] = useState<IBookmarksObj['folderList']>({});
  const [folders, setFolders] = useState<IBookmarksObj['folders']>({});

  const initBookmarksData = useCallback(async () => {
    if (!folderContext) {
      //show error page
      throw new Error('No folder found');
    }
    if (!data) {
      return;
    }
    setIsIniting(true);
    const { folders, urlList, folderList } = data;
    const folderContextHash = md5(folderContext);
    const modifiedBookmarks = Object.entries(folders[folderContextHash]).map(
      (kvp) => bookmarksMapper(kvp, urlList, folderList)
    );
    setContextBookmarks(modifiedBookmarks);
    // setUrlList(urlList);
    // setFolderList(folderList);
    setFolders(folders);
    setIsIniting(false);
  }, [data, folderContext]);

  useEffect(() => {
    console.log(document.referrer);
    initBookmarksData();
  }, [initBookmarksData]);

  // if no user, then throw error
  return (
    <Container maxWidth="md">
      {!isLoading && !isIniting ? (
        <FixedSizeList<VirtualRowProps>
          height={height}
          width="100%"
          itemSize={31}
          itemCount={contextBookmarks.length}
          overscanCount={10}
          itemKey={(index, data) => {
            const { isDir, url, name } = data.contextBookmarks[index];
            return (isDir ? name : url) ?? '';
          }}
          itemData={{
            folders,
            contextBookmarks,
          }}
        >
          {VirtualRow}
        </FixedSizeList>
      ) : (
        <div>Loading</div>
      )}
    </Container>
  );
}
