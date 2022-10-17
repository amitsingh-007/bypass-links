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
    console.log('amit 1');
    if (!folderContext) {
      console.log('amit 2');
      //show error page
      throw new Error('No folder found');
    }
    console.log('amit 3');
    if (!data) {
      console.log('amit 4');
      return;
    }
    console.log('amit 5', data);
    setIsIniting(true);
    console.log('amit 6');
    const { folders, urlList, folderList } = data;
    console.log('amit 7');
    const folderContextHash = md5(folderContext);
    console.log('amit 8');
    const modifiedBookmarks = Object.entries(folders[folderContextHash]).map(
      (kvp) => bookmarksMapper(kvp, urlList, folderList)
    );
    console.log('amit ', modifiedBookmarks);
    setContextBookmarks(modifiedBookmarks);
    // setUrlList(urlList);
    // setFo9lderList(folderList);
    setFolders(folders);
    setIsIniting(false);
    console.log('data', data);
    // console.log('contextBookmarks', contextBookmarks);
    console.log('folders', folders);
  }, [data, folderContext]);

  useEffect(() => {
    initBookmarksData();
  }, [initBookmarksData]);

  console.log('amit loading', { data, isLoading, isIniting });

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
