import { IconButton, Typography } from "@material-ui/core";
import BookmarkBorderTwoToneIcon from "@material-ui/icons/BookmarkBorderTwoTone";
import BookmarkTwoToneIcon from "@material-ui/icons/BookmarkTwoTone";
import { getCurrentTab } from "ChromeApi/tabs";
import { COLOR } from "GlobalConstants/color";
import { defaultBookmarkFolder } from "GlobalConstants";
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
} from "SrcPath/BookmarksPanel/utils";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { BlackTooltip } from "GlobalComponents/StyledComponents";

const QuickBookmarkButton = memo(() => {
  const { isSignedIn } = useSelector((state) => state.root);
  const [bookmark, setBookmark] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();

  const initBookmark = async () => {
    setIsFetching(true);
    const { url } = await getCurrentTab();
    const bookmarks = await getBookmarksObj();
    if (bookmarks) {
      const encodedBookmark = bookmarks.urlList[md5(url)];
      if (encodedBookmark) {
        const decodedBookmark = getDecodedBookmark(encodedBookmark);
        setBookmark(decodedBookmark);
      }
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
      const { url, title, parentHash } = bookmark;
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
    <BlackTooltip
      title={
        <Typography sx={{ fontSize: "13px" }}>
          {bookmark.title.length > 82
            ? `${bookmark.title.substring(0, 82)}...`
            : bookmark.title}
        </Typography>
      }
      arrow
      disableInteractive
    >
      <IconButton
        component="span"
        style={getActiveDisabledColor(isSignedIn, COLOR.pink)}
        onClick={handleClick}
        disabled={!isSignedIn}
      >
        <BookmarkTwoToneIcon fontSize="large" />
      </IconButton>
    </BlackTooltip>
  ) : (
    <IconButton
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
