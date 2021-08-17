import { Box, Button } from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import ProgressiveRender from "GlobalComponents/ProgressiveRender";
import md5 from "md5";
import { memo, useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";
import Ripples from "react-ripples";
import usePrevious from "SrcPath/hooks/usePrevious";
import { Subtract } from "utility-types";
import { bookmarkRowStyles, BOOKMARK_ROW_DIMENTSIONS } from "../constants";
import { ICurDraggingBookmark } from "../interfaces";
import "../scss/withBookmarkRow.scss";
import { isInInitalView } from "../utils";

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
  memo<Subtract<T, InjectedProps> & ExpectedProps>(function BookmarkRowHoc(
    props
  ) {
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
    const prevEditBookmark = usePrevious(editBookmark);
    const primaryUniqueId = (isDir ? name : url) || "";
    const secondaryUniqueId = isDir ? null : title;

    useEffect(() => {
      // Scroll into view after dialog close
      const node = document.querySelector<HTMLDivElement>(
        `[data-text='${primaryUniqueId}']`
      );
      if (prevEditBookmark && !editBookmark && node) {
        node.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, [editBookmark, prevEditBookmark, primaryUniqueId]);

    const showDragCount =
      !isDir &&
      curDraggingBookmark.uid === md5(primaryUniqueId) &&
      curDraggingBookmark.dragCount > 0;

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
            <ProgressiveRender
              containerStyles={{
                height: `${BOOKMARK_ROW_DIMENTSIONS.height}px`,
                width: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center ",
              }}
              forceRender={editBookmark || isInInitalView(pos)}
            >
              <Ripples>
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Component
                    {...(props as unknown as T)}
                    containerStyles={bookmarkRowStyles}
                  />
                </Box>
              </Ripples>
              {showDragCount ? (
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{
                    position: "absolute",
                    right: "3px",
                    fontSize: "12px",
                    minWidth: "unset",
                    padding: "0px 7px",
                    borderRadius: "50%",
                  }}
                >
                  {curDraggingBookmark.dragCount}
                </Button>
              ) : null}
            </ProgressiveRender>
          </Box>
        )}
      </Draggable>
    );
  });

export default withBookmarkRow;
