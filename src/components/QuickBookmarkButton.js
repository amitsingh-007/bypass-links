import { IconButton } from "@material-ui/core";
import BookmarkBorderTwoToneIcon from "@material-ui/icons/BookmarkBorderTwoTone";
import BookmarkTwoToneIcon from "@material-ui/icons/BookmarkTwoTone";
import storage from "ChromeApi/storage";
import { getCurrentTab } from "ChromeApi/tabs";
import { COLOR } from "GlobalConstants/color";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { ROUTES } from "GlobalConstants/routes";
import { getActiveDisabledColor } from "GlobalUtils/color";
import md5 from "md5";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { IconButtonLoader } from "./Loader";

const QuickBookmarkButton = memo(() => {
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const [bookmark, setBookmark] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();

  const initBookmark = async () => {
    setIsFetching(true);
    const [{ url }] = await getCurrentTab();
    const { [STORAGE_KEYS.bookmarks]: bookmarks } = await storage.get([
      STORAGE_KEYS.bookmarks,
    ]);
    const bookmark = bookmarks[md5(url)];
    setBookmark(bookmark);
    setIsFetching(false);
  };

  useEffect(() => {
    setIsFetching(isSignedIn);
    if (isSignedIn) {
      initBookmark();
    }
  }, [isSignedIn]);

  const handleClick = async () => {
    const payload = {};
    if (bookmark) {
      payload.isBookmarked = true;
      payload.title = decodeURIComponent(atob(bookmark.title));
      payload.url = decodeURIComponent(atob(bookmark.url));
    } else {
      const [{ url, title }] = await getCurrentTab();
      payload.isBookmarked = false;
      payload.title = title;
      payload.url = url;
    }
    const url = `${ROUTES.QUICK_BOOKMARK_PANEL}?${new URLSearchParams(
      payload
    ).toString()}`;
    history.push(url);
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
