import { Box, Button } from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import md5 from "md5";
import { memo, useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";
import Ripples from "react-ripples";
import usePrevious from "SrcPath/hooks/usePrevious";
import { Subtract } from "utility-types";
import { bookmarkRowStyles, BOOKMARK_ROW_DIMENTSIONS } from "../constants";
import { ICurDraggingBookmark } from "../interfaces";
import "../scss/withBookmarkRow.scss";

export interface InjectedProps {
  containerStyles: SxProps;
}

interface ExpectedProps {
  isDir: boolean;
  pos: number;
  name?: string;
  url?: string;
  title?: string;
  isSelected?: boolean;
  editBookmark?: boolean;
  curDraggingBookmark: ICurDraggingBookmark;
}

const withBookmarkRow = <T extends InjectedProps>(
  Component: React.ComponentType<T>
) =>
  memo<Subtract<T, InjectedProps> & ExpectedProps>((props) => {
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
    const bookmarkRef = useRef<HTMLDivElement>(null);
    const prevEditBookmark = usePrevious(editBookmark);
    const primaryUniqueId = (isDir ? name : url) || "";
    const secondaryUniqueId = isDir ? null : title;

    useEffect(() => {
      // Scroll into view after dialog close
      if (prevEditBookmark && !editBookmark && bookmarkRef?.current) {
        bookmarkRef.current.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }
    }, [editBookmark, prevEditBookmark]);

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
                  flexGrow: 1,
                  maxWidth: `${BOOKMARK_ROW_DIMENTSIONS.width}px`,
                }}
                ref={bookmarkRef}
              >
                <Component
                  {...(props as unknown as T)}
                  containerStyles={bookmarkRowStyles}
                />
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
