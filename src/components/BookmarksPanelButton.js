import { IconButton } from "@material-ui/core";
import CollectionsBookmarkTwoToneIcon from "@material-ui/icons/CollectionsBookmarkTwoTone";
import { showBookmarksPanel } from "GlobalActionCreators/index";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";

const BookmarksPanelButton = memo(() => {
  const dispatch = useDispatch();
  const isSignedIn = useSelector((state) => state.isSignedIn);

  const handleShowEditPanel = () => {
    dispatch(showBookmarksPanel());
  };

  return (
    <IconButton
      aria-label="OpenBookmarsPanel"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.blue)}
      onClick={handleShowEditPanel}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Bookmarks Panel" : undefined}
    >
      <CollectionsBookmarkTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default BookmarksPanelButton;
