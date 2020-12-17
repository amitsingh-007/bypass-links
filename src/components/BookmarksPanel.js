import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import runtime from "ChromeApi/runtime";
import { hideBookmarksPanel } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import md5 from "md5";
import React, { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import BookmarkRow from "./BookmarkRow";
import Loader from "./Loader";
import PanelHeading from "./PanelHeading";

//Filter valid bookmarks
const validBookmarks = (obj) => !!(obj && obj.url);

//Map array into object so as to store in firebase
const reducer = (obj, { url }) => {
  obj[md5(url)] = { url: btoa(url) };
  return obj;
};

const BookmarksPanel = memo(() => {
  const dispatch = useDispatch();
  const [bookmarks, setBookmarks] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    runtime.sendMessage({ getBookmarks: true }).then(({ bookmarks }) => {
      const modifiedBookmarks = Object.entries(
        bookmarks
      ).map(([key, { url }]) => ({ url: atob(url) }));
      setBookmarks(modifiedBookmarks);
      setIsFetching(false);
    });
  }, []);

  const handleClose = () => {
    dispatch(hideBookmarksPanel());
  };

  const handleRemoveBookmark = (pos) => {
    const newRedirections = [...bookmarks];
    newRedirections.splice(pos, 1);
    setBookmarks(newRedirections);
  };

  const handleSave = () => {
    console.log("Saving these bookmarks to Firebase", bookmarks);
    const bookmarksObj = bookmarks.filter(validBookmarks).reduce(reducer, {});
    runtime
      .sendMessage({ saveBookmarks: bookmarksObj })
      .then(({ isBookmarksSaveSuccess }) => {
        if (isBookmarksSaveSuccess) {
          handleClose();
        }
      });
  };

  return (
    <Box
      width="max-content"
      display="flex"
      flexDirection="column"
      paddingBottom="8px"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <IconButton
            aria-label="Discard"
            component="span"
            style={COLOR.red}
            onClick={handleClose}
            title="Discard and Close"
          >
            <ArrowBackTwoToneIcon fontSize="large" />
          </IconButton>
          <IconButton
            aria-label="Save"
            component="span"
            style={COLOR.green}
            onClick={handleSave}
            title="Save and Close"
          >
            <SaveTwoToneIcon fontSize="large" />
          </IconButton>
        </Box>
        <PanelHeading heading="BOOKMARKS PANEL" />
      </Box>
      {isFetching ? <Loader width="596px" /> : null}
      {!isFetching && bookmarks && bookmarks.length > 0 ? (
        <form noValidate autoComplete="off" style={{ paddingLeft: "12px" }}>
          {bookmarks.map(({ url }, index) => (
            <BookmarkRow
              key={url}
              pos={index}
              url={url}
              handleRemoveBookmark={handleRemoveBookmark}
            />
          ))}
        </form>
      ) : null}
    </Box>
  );
});

export default BookmarksPanel;
