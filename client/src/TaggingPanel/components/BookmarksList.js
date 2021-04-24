import {
  Avatar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
} from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import PanelHeading from "GlobalComponents/PanelHeading";
import { COLOR } from "GlobalConstants/color";
import { forwardRef, memo, useCallback, useEffect, useState } from "react";
import Ripples from "react-ripples";
import { BookmarkExternal } from "SrcPath/BookmarksPanel/components/Bookmark";
import { bookmarkRowStyles } from "SrcPath/BookmarksPanel/constants";
import { getFromHash } from "SrcPath/BookmarksPanel/utils/bookmark";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" {...props} ref={ref} />
));

const imageStyles = { width: 40, height: 40 };

const BookmarksList = memo(({ name, imageUrl, taggedUrls, handleClose }) => {
  const [bookmarks, setBookmarks] = useState([]);

  const initBookmarks = useCallback(async () => {
    if (!taggedUrls?.length) {
      return;
    }
    const fetchedbookmarks = await Promise.all(
      taggedUrls.map(async (urlHash) => {
        const { url, title } = await getFromHash(false, urlHash);
        return {
          url: decodeURIComponent(atob(url)),
          title: decodeURIComponent(atob(title)),
        };
      })
    );
    setBookmarks(fetchedbookmarks);
  }, [taggedUrls]);

  useEffect(() => {
    initBookmarks();
  }, [initBookmarks]);

  return (
    <Dialog
      fullScreen
      open
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ padding: "0 6px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton
            aria-label="Discard"
            component="span"
            style={COLOR.red}
            onClick={handleClose}
            title="Discard and Close"
          >
            <ArrowBackTwoToneIcon fontSize="large" />
          </IconButton>
          <PanelHeading
            heading={
              <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                <Avatar alt={name} src={imageUrl} sx={imageStyles} />
                <Box
                  component="span"
                  sx={{ marginLeft: "14px", textTransform: "uppercase" }}
                >
                  {name}
                </Box>
              </Box>
            }
          />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: 0 }}>
        {bookmarks.length > 0 ? (
          bookmarks.map(({ url, title }) => (
            <Box
              sx={{ width: "100%", cursor: "pointer", userSelect: "none" }}
              className="bookmarkRowContainer"
              key={url}
            >
              <Ripples>
                <BookmarkExternal
                  url={url}
                  title={title}
                  isExternalPage
                  containerStyles={bookmarkRowStyles}
                />
              </Ripples>
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: "center", marginTop: "30px" }}>
            No tagged bookmarks found
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default BookmarksList;
