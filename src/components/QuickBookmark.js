import { IconButton } from "@material-ui/core";
import BookmarkBorderTwoToneIcon from "@material-ui/icons/BookmarkBorderTwoTone";
import BookmarkTwoToneIcon from "@material-ui/icons/BookmarkTwoTone";
import runtime from "ChromeApi/runtime";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const QuickBookmark = memo(() => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const isSignedIn = useSelector((state) => state.isSignedIn);

  useEffect(() => {
    if (isSignedIn) {
      runtime.sendMessage({ isBookmarked: true }).then(({ isBookmarked }) => {
        setIsBookmarked(isBookmarked);
      });
    }
  }, [isSignedIn]);

  const handleBookmarkAdd = () => {
    runtime.sendMessage({ addBookmark: true }).then(({ isBookmarkAdded }) => {
      if (isBookmarkAdded) {
        setIsBookmarked(true);
      }
    });
  };

  const handleBookmarkRemove = () => {
    runtime
      .sendMessage({ removeBookmark: true })
      .then(({ isBookmarkRemoved }) => {
        if (isBookmarkRemoved) {
          setIsBookmarked(false);
        }
      });
  };

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
