import { IconButton } from "@material-ui/core";
import BookmarkBorderTwoToneIcon from "@material-ui/icons/BookmarkBorderTwoTone";
import BookmarkTwoToneIcon from "@material-ui/icons/BookmarkTwoTone";
import runtime from "ChromeApi/runtime";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "./Loader";

const QuickBookmark = memo(() => {
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setIsFetching(isSignedIn);
    if (isSignedIn) {
      setIsFetching(true);
      runtime.sendMessage({ isBookmarked: true }).then(({ isBookmarked }) => {
        setIsBookmarked(isBookmarked);
        setIsFetching(false);
      });
    }
  }, [isSignedIn]);

  const handleBookmarkAdd = () => {
    setIsFetching(true);
    runtime.sendMessage({ addBookmark: true }).then(({ isBookmarkAdded }) => {
      if (isBookmarkAdded) {
        setIsBookmarked(true);
        setIsFetching(false);
      }
    });
  };

  const handleBookmarkRemove = () => {
    setIsFetching(true);
    runtime
      .sendMessage({ removeBookmark: true })
      .then(({ isBookmarkRemoved }) => {
        if (isBookmarkRemoved) {
          setIsBookmarked(false);
          setIsFetching(false);
        }
      });
  };

  if (isFetching) {
    return <Loader width="59px" loaderSize={28} display="inline-flex" />;
  }

  return isBookmarked ? (
    <IconButton
      aria-label="Bookmarked"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.pink)}
      onClick={handleBookmarkRemove}
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
      onClick={handleBookmarkAdd}
      disabled={!isSignedIn}
      title={isSignedIn ? "Not Bookmarked" : undefined}
    >
      <BookmarkBorderTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default QuickBookmark;
