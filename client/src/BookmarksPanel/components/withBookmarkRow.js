import { Box, Button } from "@material-ui/core";
import md5 from "md5";
import { memo, useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";
import Ripples from "react-ripples";
import { bookmarkRowStyles, BOOKMARK_ROW_DIMENTSIONS } from "../constants";
import "../scss/withBookmarkRow.scss";

const withBookmarkRow = (Component) =>
  memo((props) => {
    const bookmarkRef = useRef(null);
    const {
      isDir,
      name,
      url,
      pos,
      title,
      isSelected,
      editBookmark,
      curDraggingBookmark,
    } = props;
    const primaryUniqueId = isDir ? name : url;
    const secondaryUniqueId = isDir ? null : title;

    useEffect(() => {
      // Scroll into view after dialog close
      if (!editBookmark && bookmarkRef?.current) {
        bookmarkRef.current.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }
    }, [editBookmark]);

    return (
      <Draggable draggableId={primaryUniqueId} index={pos}>
        {(provided) => (
          <Box
            className="bookmarkRowContainer"
            ref={provided.innerRef}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            data-text={primaryUniqueId}
            data-subtext={secondaryUniqueId}
            data-is-selected={isSelected}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Ripples>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: "1",
                  maxWidth: `${BOOKMARK_ROW_DIMENTSIONS.width}px`,
                }}
                ref={bookmarkRef}
              >
                <Component {...props} containerStyles={bookmarkRowStyles} />
              </Box>
            </Ripples>
            {!isDir &&
            curDraggingBookmark.uid === md5(primaryUniqueId) &&
            curDraggingBookmark.dragCount > 0 ? (
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  mr: "8px",
                  fontSize: "12px",
                  minWidth: "unset",
                  padding: "0px 7px",
                  borderRadius: "50%",
                }}
              >
                {curDraggingBookmark.dragCount}
              </Button>
            ) : null}
          </Box>
        )}
      </Draggable>
    );
  });

export default withBookmarkRow;
