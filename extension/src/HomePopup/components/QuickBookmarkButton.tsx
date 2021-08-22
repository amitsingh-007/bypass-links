import { Typography } from "@material-ui/core";
import BookmarkBorderTwoToneIcon from "@material-ui/icons/BookmarkBorderTwoTone";
import BookmarkTwoToneIcon from "@material-ui/icons/BookmarkTwoTone";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import { defaultBookmarkFolder } from "GlobalConstants";
import { getCurrentTab } from "GlobalHelpers/chrome/tabs";
import { getBookmarks } from "GlobalHelpers/fetchFromStorage";
import { RootState } from "GlobalReducers/rootReducer";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { BOOKMARK_OPERATION } from "SrcPath/BookmarksPanel/constants";
import { IBookmark } from "SrcPath/BookmarksPanel/interfaces";
import { BMPanelQueryParams } from "SrcPath/BookmarksPanel/interfaces/url";
import {
  getDecodedBookmark,
  getFolderFromHash,
} from "SrcPath/BookmarksPanel/utils";
import { getBookmarksPanelUrl } from "SrcPath/BookmarksPanel/utils/url";
import StyledButton from "./StyledButton";

const QuickBookmarkButton = memo(function QuickBookmarkButton() {
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
    const urlParams = {} as Partial<BMPanelQueryParams>;
    if (bookmark) {
      const { url, parentHash } = bookmark;
      const parent = await getFolderFromHash(parentHash);
      urlParams.operation = BOOKMARK_OPERATION.EDIT;
      urlParams.bmUrl = url;
      urlParams.folderContext = atob(parent.name);
    } else {
      const { url } = await getCurrentTab();
      urlParams.operation = BOOKMARK_OPERATION.ADD;
      urlParams.bmUrl = url;
      urlParams.folderContext = defaultBookmarkFolder;
    }
    history.push(getBookmarksPanelUrl(urlParams));
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isLoading={isFetching}
      isDisabled={!isSignedIn}
      onClick={handleClick}
    >
      {bookmark ? (
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
          <BookmarkTwoToneIcon />
        </BlackTooltip>
      ) : (
        <BookmarkBorderTwoToneIcon />
      )}
    </StyledButton>
  );
});

export default QuickBookmarkButton;
