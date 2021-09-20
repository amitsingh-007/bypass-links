import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import PanelHeading from "GlobalComponents/PanelHeading";
import SearchWrapper from "GlobalComponents/SearchWrapper";
import { BG_COLOR_DARK } from "GlobalConstants/color";
import { memo, useCallback, useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import { BookmarkExternal } from "SrcPath/BookmarksPanel/components/Bookmark";
import {
  bookmarkRowStyles,
  BOOKMARK_OPERATION,
} from "SrcPath/BookmarksPanel/constants";
import { IBookmark } from "SrcPath/BookmarksPanel/interfaces";
import {
  getBookmarkFromHash,
  getDecodedBookmark,
  getFolderFromHash,
} from "SrcPath/BookmarksPanel/utils";
import { getBookmarksPanelUrl } from "SrcPath/BookmarksPanel/utils/url";

const imageStyles = { width: 40, height: 40 };

interface Props {
  name: string;
  imageUrl: string;
  taggedUrls: string[];
}

interface ModifiedBookmark extends IBookmark {
  parentName: string;
}

const BookmarksList = memo<Props>(function BookmarksList({
  name,
  imageUrl,
  taggedUrls,
}) {
  const history = useHistory();
  const [bookmarks, setBookmarks] = useState<ModifiedBookmark[]>([]);

  const initBookmarks = useCallback(async () => {
    if (!taggedUrls?.length) {
      return;
    }
    const fetchedBookmarks = await Promise.all(
      taggedUrls.map(async (urlHash) => {
        const bookmark = await getBookmarkFromHash(urlHash);
        const parent = await getFolderFromHash(bookmark.parentHash);
        const decodedBookmark = getDecodedBookmark(bookmark);
        return {
          ...decodedBookmark,
          parentName: atob(parent.name),
        } as ModifiedBookmark;
      })
    );
    setBookmarks(fetchedBookmarks);
  }, [taggedUrls]);

  const handleBookmarkEdit = async ({ url, parentName }: ModifiedBookmark) => {
    history.push(
      getBookmarksPanelUrl({
        operation: BOOKMARK_OPERATION.EDIT,
        bmUrl: url,
        folderContext: parentName,
      })
    );
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
          <Button
            variant="outlined"
            startIcon={<HiOutlineArrowNarrowLeft />}
            onClick={handleClose}
            size="small"
            color="error"
          >
            Back
          </Button>
          <Box sx={{ display: "flex" }}>
            <SearchWrapper searchClassName="bookmarkRowContainer" />
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
      <DialogContent sx={{ p: 0, pt: "4px !important" }}>
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
              }}
              className="bookmarkRowContainer"
              data-text={bookmark.url}
              data-subtext={bookmark.title}
              key={bookmark.url}
            >
              <IconButton
                size="small"
                title="Edit Bookmark"
                color="info"
                edge="end"
                onClick={() => {
                  handleBookmarkEdit(bookmark);
                }}
                sx={{ mr: "4px" }}
              >
                <AiFillEdit style={{ fontSize: "22px" }} />
              </IconButton>
              <BookmarkExternal
                url={bookmark.url}
                title={bookmark.title}
                taggedPersons={bookmark.taggedPersons}
                containerStyles={{
                  ...bookmarkRowStyles,
                  paddingLeft: "0px",
                  maxWidth: "756px",
                }}
              />
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
