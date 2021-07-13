import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import EditTwoToneIcon from "@material-ui/icons/EditTwoTone";
import PanelHeading from "GlobalComponents/PanelHeading";
import { BG_COLOR_DARK, COLOR } from "GlobalConstants/color";
import { memo, useCallback, useEffect, useState } from "react";
import Ripples from "react-ripples";
import { useHistory } from "react-router";
import { BookmarkExternal } from "SrcPath/BookmarksPanel/components/Bookmark";
import { bookmarkRowStyles } from "SrcPath/BookmarksPanel/constants";
import {
  getBookmarksPanelUrl,
  getDecodedBookmark,
  getFromHash,
} from "SrcPath/BookmarksPanel/utils";
import SearchInput from "GlobalComponents/SearchInput";
import { Bookmark } from "SrcPath/BookmarksPanel/interfaces";

const imageStyles = { width: 40, height: 40 };

interface Props {
  name: string;
  imageUrl: string;
  taggedUrls: string[];
}

interface ModifiedBookmark extends Bookmark {
  parentName: string;
}

const BookmarksList = memo<Props>(({ name, imageUrl, taggedUrls }) => {
  const history = useHistory();
  const [bookmarks, setBookmarks] = useState<ModifiedBookmark[]>([]);

  const initBookmarks = useCallback(async () => {
    if (!taggedUrls?.length) {
      return;
    }
    const fetchedBookmarks = await Promise.all(
      taggedUrls.map(async (urlHash) => {
        const bookmark = await getFromHash(false, urlHash);
        const parent = await getFromHash(true, bookmark.parentHash);
        const decodedBookmark = getDecodedBookmark(bookmark);
        return {
          ...decodedBookmark,
          parentName: atob(parent.name),
        } as ModifiedBookmark;
      })
    );
    setBookmarks(fetchedBookmarks);
  }, [taggedUrls]);

  const handleBookmarkEdit = async ({
    url,
    title,
    parentName,
  }: ModifiedBookmark) => {
    //TODO:change this
    const urlParams = {} as any;
    urlParams.editBookmark = true;
    urlParams.url = url;
    urlParams.title = title;
    urlParams.folder = parentName;
    history.push(getBookmarksPanelUrl(urlParams));
  };

  const handleClose = () => {
    history.goBack();
  };

  useEffect(() => {
    initBookmarks();
  }, [initBookmarks]);

  return (
    <Dialog open fullScreen onClose={handleClose}>
      <DialogTitle sx={{ padding: "4px 6px", backgroundColor: BG_COLOR_DARK }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton
            size="small"
            aria-label="Discard"
            component="span"
            style={COLOR.red}
            onClick={handleClose}
            title="Discard and Close"
          >
            <ArrowBackTwoToneIcon fontSize="large" />
          </IconButton>
          <Box sx={{ display: "flex" }}>
            <SearchInput searchClassName="bookmarkRowContainer" />
            <PanelHeading
              containerStyles={{ display: "inline-flex", ml: "8px" }}
              heading={
                <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                  <Avatar alt={name} src={imageUrl} sx={imageStyles} />
                  <Box
                    component="span"
                    sx={{ marginLeft: "14px", textTransform: "uppercase" }}
                  >
                    {`${name} (${bookmarks?.length || 0})`}
                  </Box>
                </Box>
              }
            />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: "8px 0 0 0" }}>
        {bookmarks.length > 0 ? (
          bookmarks.map((bookmark) => (
            <Box
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                cursor: "pointer",
                userSelect: "none",
                paddingLeft: "8px",
              }}
              className="bookmarkRowContainer"
              data-text={bookmark.url}
              data-subtext={bookmark.title}
              key={bookmark.url}
            >
              <IconButton
                size="small"
                aria-label="Edit Bookmark"
                title="Edit Bookmark"
                style={COLOR.blue}
                edge="end"
                onClick={() => {
                  handleBookmarkEdit(bookmark);
                }}
                sx={{ mr: "4px" }}
              >
                <EditTwoToneIcon sx={{ fontSize: 22 }} />
              </IconButton>
              <Ripples>
                <BookmarkExternal
                  url={bookmark.url}
                  title={bookmark.title}
                  taggedPersons={bookmark.taggedPersons}
                  isExternalPage
                  containerStyles={{ ...bookmarkRowStyles, paddingLeft: "0px" }}
                />
              </Ripples>
              <Button
                variant="contained"
                color="secondary"
                disableElevation
                disableFocusRipple
                disableTouchRipple
                disableRipple
                sx={{
                  position: "absolute",
                  right: "2px",
                  fontSize: "9px",
                  minWidth: "unset",
                  padding: "2px 5px",
                  borderRadius: "50px",
                }}
              >
                {bookmark.parentName}
              </Button>
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
