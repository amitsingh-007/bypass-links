import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import { hideBookmarksPanel } from "GlobalActionCreators/index";
import { FIREBASE_DB_REF } from "GlobalConstants/index";
import { COLOR } from "GlobalConstants/color";
import { getFromFirebase, saveDataToFirebase } from "GlobalUtils/firebase";
import md5 from "md5";
import React, { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import BookmarkRow from "./BookmarkRow";
import Loader from "./Loader";
import PanelHeading from "./PanelHeading";

//Filter valid bookmarks
const validBookmarks = (obj) => !!(obj && obj.url && obj.title);

//Map array into object so as to store in firebase
const reducer = (obj, { url, title }) => {
  obj[md5(url)] = {
    url: btoa(encodeURIComponent(url)),
    title: btoa(encodeURIComponent(title)),
  };
  return obj;
};

const BookmarksPanel = memo(() => {
  const dispatch = useDispatch();
  const [bookmarks, setBookmarks] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const initBookmarks = async () => {
    const snapshot = await getFromFirebase(FIREBASE_DB_REF.bookmarks);
    const bookmarks = snapshot.val();
    const modifiedBookmarks = Object.entries(bookmarks).map(
      ([key, { url, title }]) => ({
        url: decodeURIComponent(atob(url)),
        title: decodeURIComponent(atob(title)),
      })
    );
    setBookmarks(modifiedBookmarks);
    setIsFetching(false);
  };

  useEffect(() => {
    initBookmarks();
  }, []);

  const handleClose = () => {
    dispatch(hideBookmarksPanel());
  };

  const handleRemoveBookmark = (pos) => {
    const newRedirections = [...bookmarks];
    newRedirections.splice(pos, 1);
    setBookmarks(newRedirections);
  };

  const handleSave = async () => {
    setIsFetching(true);
    console.log("Saving these bookmarks to Firebase", bookmarks);
    const bookmarksObj = bookmarks.filter(validBookmarks).reduce(reducer, {});
    const isSaveSuccess = await saveDataToFirebase(
      bookmarksObj,
      FIREBASE_DB_REF.bookmarks
    );
    setIsFetching(false);
    if (isSaveSuccess) {
      handleClose();
    }
  };

  return (
    <Box
      width="800px"
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
      {isFetching ? <Loader width="800px" marginBottom="12px" /> : null}
      {!isFetching && bookmarks && bookmarks.length > 0 ? (
        <form noValidate autoComplete="off">
          {bookmarks.map(({ url, title }, index) => (
            <BookmarkRow
              key={url}
              pos={index}
              url={url}
              title={title}
              handleRemoveBookmark={handleRemoveBookmark}
            />
          ))}
        </form>
      ) : null}
    </Box>
  );
});

export default BookmarksPanel;
