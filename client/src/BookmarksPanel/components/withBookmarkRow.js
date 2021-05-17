import { Box } from "@material-ui/core";
import { memo, useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";
import Ripples from "react-ripples";
import { bookmarkRowStyles, BOOKMARK_ROW_DIMENTSIONS } from "../constants";

const withBookmarkRow = (Component) =>
  memo((props) => {
    const bookmarkRef = useRef(null);
    const { isDir, name, url, pos, title, isSelected, editBookmark } = props;
    const primaryUniqueId = isDir ? name : url;
    const secondaryUniqueId = isDir ? null : title;

    useEffect(() => {
      if (editBookmark && bookmarkRef?.current) {
        setTimeout(() => {
          bookmarkRef.current.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }, 0);
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
          </Box>
        )}
      </Draggable>
    );
  });

export default withBookmarkRow;
