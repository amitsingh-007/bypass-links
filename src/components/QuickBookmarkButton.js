import { IconButton } from "@material-ui/core";
import BookmarkBorderTwoToneIcon from "@material-ui/icons/BookmarkBorderTwoTone";
import BookmarkTwoToneIcon from "@material-ui/icons/BookmarkTwoTone";
import { getCurrentTab } from "ChromeApi/tabs";
import { COLOR } from "GlobalConstants/color";
import { defaultBookmarkFolder, FIREBASE_DB_REF } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { saveDataToFirebase } from "GlobalUtils/firebase";
import md5 from "md5";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getBookmarksPanelUrl } from "SrcPath/BookmarksPanel/utils";
import {
  getBookmarksObj,
  getFromHash,
  syncBookmarksToStorage,
} from "SrcPath/BookmarksPanel/utils/bookmark";
import { IconButtonLoader } from "./Loader";

const QuickBookmarkButton = memo(() => {
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const [bookmark, setBookmark] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();

  const runOnProd = async () => {
    const bookmarks = await getBookmarksObj();
    const rootFolderContent = [];
    const urlList = Object.entries(bookmarks).reduce((obj, [key, value]) => {
      rootFolderContent.push({ isDir: false, hash: key });
      obj[key] = { ...value, parentHash: md5("Bookmarks bar") };
      return obj;
    }, {});
    const newBookmarksObj = {
      folderList: {
        [md5("Bookmarks bar")]: {
          name: btoa("Bookmarks bar"),
          parentHash: null,
        },
      },
      urlList,
      folders: {
        [md5("Bookmarks bar")]: rootFolderContent,
      },
    };
    await saveDataToFirebase(
      newBookmarksObj,
      FIREBASE_DB_REF.bookmarks,
      syncBookmarksToStorage
    );
  };

  const initBookmark = async () => {
    await runOnProd();
    // setIsFetching(true);
    // const [{ url }] = await getCurrentTab();
    // const bookmarks = await getBookmarksObj();
    // const bookmark = bookmarks.urlList[md5(url)];
    // setBookmark(bookmark);
    // setIsFetching(false);
  };

  useEffect(() => {
    setIsFetching(isSignedIn);
    if (isSignedIn) {
      initBookmark();
    }
  }, [isSignedIn]);

  const handleClick = async () => {
    const urlParams = {};
    if (bookmark) {
      const parent = await getFromHash(true, bookmark.parentHash);
      urlParams.editBookmark = true;
      urlParams.url = decodeURIComponent(atob(bookmark.url));
      urlParams.title = decodeURIComponent(atob(bookmark.title));
      urlParams.folder = atob(parent.name);
    } else {
      const [{ url, title }] = await getCurrentTab();
      urlParams.addBookmark = true;
      urlParams.url = url;
      urlParams.title = title;
      urlParams.folder = defaultBookmarkFolder;
    }
    history.push(getBookmarksPanelUrl(urlParams));
  };

  if (isFetching) {
    return <IconButtonLoader />;
  }

  return bookmark ? (
    <IconButton
      aria-label="Bookmarked"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.pink)}
      onClick={handleClick}
      disabled={!isSignedIn}
      title={isSignedIn ? "Bookmarked" : undefined}
    >
      <BookmarkTwoToneIcon fontSize="large" />
    </IconButton>
  ) : (
    <IconButton
      aria-label="NotBookmarked"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.pink)}
      onClick={handleClick}
      disabled={!isSignedIn}
      title={isSignedIn ? "Not Bookmarked" : undefined}
    >
      <BookmarkBorderTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default QuickBookmarkButton;
