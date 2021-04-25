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
import EditTwoToneIcon from "@material-ui/icons/EditTwoTone";
import PanelHeading from "GlobalComponents/PanelHeading";
import { BG_COLOR_DARK, COLOR } from "GlobalConstants/color";
import { forwardRef, memo, useCallback, useEffect, useState } from "react";
import Ripples from "react-ripples";
import { useHistory } from "react-router";
import { BookmarkExternal } from "SrcPath/BookmarksPanel/components/Bookmark";
import { bookmarkRowStyles } from "SrcPath/BookmarksPanel/constants";
import { getBookmarksPanelUrl } from "SrcPath/BookmarksPanel/utils";
import {
  getDecodedBookmark,
  getFromHash,
} from "SrcPath/BookmarksPanel/utils/bookmark";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" {...props} ref={ref} />
));

const imageStyles = { width: 40, height: 40 };

const BookmarksList = memo(({ name, imageUrl, taggedUrls, handleClose }) => {
  const history = useHistory();
  const [bookmarks, setBookmarks] = useState([]);

  const initBookmarks = useCallback(async () => {
    if (!taggedUrls?.length) {
      return;
    }
    const fetchedbookmarks = await Promise.all(
      taggedUrls.map(async (urlHash) => {
        const bookmark = await getFromHash(false, urlHash);
        return getDecodedBookmark(bookmark);
      })
    );
    setBookmarks(fetchedbookmarks);
  }, [taggedUrls]);

  const handleBookmarkEdit = async ({ url, title, parentHash }) => {
    const urlParams = {};
    const parent = await getFromHash(true, parentHash);
    urlParams.editBookmark = true;
    urlParams.url = url;
    urlParams.title = title;
    urlParams.folder = atob(parent.name);
    history.push(getBookmarksPanelUrl(urlParams));
  };

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
      <DialogTitle sx={{ padding: "0 6px", backgroundColor: BG_COLOR_DARK }}>
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
            containerStyles={{ display: "inline-flex" }}
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
          bookmarks.map((bookmark) => (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                cursor: "pointer",
                userSelect: "none",
                paddingLeft: "8px",
              }}
              className="bookmarkRowContainer"
              key={bookmark.url}
            >
              <IconButton
                aria-label="Edit Bookmark"
                title="Edit Bookmark"
                style={COLOR.blue}
                size="small"
                edge="end"
                onClick={() => {
                  handleBookmarkEdit(bookmark);
                }}
              >
                <EditTwoToneIcon />
              </IconButton>
              <Ripples>
                <BookmarkExternal
                  url={bookmark.url}
                  title={bookmark.title}
                  isExternalPage
                  containerStyles={{ ...bookmarkRowStyles, paddingLeft: "0px" }}
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
