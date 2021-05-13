import { IconButton } from "@material-ui/core";
import BookmarkBorderTwoToneIcon from "@material-ui/icons/BookmarkBorderTwoTone";
import BookmarkTwoToneIcon from "@material-ui/icons/BookmarkTwoTone";
import { getCurrentTab } from "ChromeApi/tabs";
import { COLOR } from "GlobalConstants/color";
import { defaultBookmarkFolder } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getBookmarksObj,
  getBookmarksPanelUrl,
  getDecodedBookmark,
  getFromHash,
} from "SrcPath/BookmarksPanel/utils/index";
import { IconButtonLoader } from "GlobalComponents/Loader";

const QuickBookmarkButton = memo(() => {
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const [bookmark, setBookmark] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();

  const initBookmark = async () => {
    setIsFetching(true);
    const { url } = await getCurrentTab();
    const bookmarks = await getBookmarksObj();
    if (bookmarks) {
      const bookmark = bookmarks.urlList[md5(url)];
      setBookmark(bookmark);
    }
    setIsFetching(false);
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
      const { url, title, parentHash } = getDecodedBookmark(bookmark);
      const parent = await getFromHash(true, parentHash);
      urlParams.editBookmark = true;
      urlParams.url = url;
      urlParams.title = title;
      urlParams.folder = atob(parent.name);
    } else {
      const { url, title } = await getCurrentTab();
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
