import { IconButton, Typography } from "@material-ui/core";
import BookmarkBorderTwoToneIcon from "@material-ui/icons/BookmarkBorderTwoTone";
import BookmarkTwoToneIcon from "@material-ui/icons/BookmarkTwoTone";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import { defaultBookmarkFolder } from "GlobalConstants";
import { COLOR } from "GlobalConstants/color";
import { getCurrentTab } from "GlobalHelpers/chrome/tabs";
import { getBookmarks } from "GlobalHelpers/fetchFromStorage";
import { RootState } from "GlobalReducers/rootReducer";
import { getActiveDisabledColor } from "GlobalUtils/color";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { IBookmark } from "SrcPath/BookmarksPanel/interfaces";
import {
  getDecodedBookmark,
  getFolderFromHash,
} from "SrcPath/BookmarksPanel/utils";
import { getBookmarksPanelUrl } from "SrcPath/BookmarksPanel/utils/url";

const QuickBookmarkButton = memo(() => {
  const { isSignedIn } = useSelector((state: RootState) => state.root);
  const [bookmark, setBookmark] = useState<IBookmark | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();

  const initBookmark = async () => {
    setIsFetching(true);
    const currentTab = await getCurrentTab();
    const url = currentTab?.url ?? "";
    const bookmarks = await getBookmarks();
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
    const urlParams = {} as any;
    if (bookmark) {
      const { url, title, parentHash } = bookmark;
      const parent = await getFolderFromHash(parentHash);
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
