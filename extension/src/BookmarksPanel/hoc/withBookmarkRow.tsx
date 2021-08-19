import { Box } from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import { memo, useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";
import Ripples from "react-ripples";
import usePrevious from "SrcPath/hooks/usePrevious";
import { Subtract } from "utility-types";
import { bookmarkRowStyles } from "../constants";
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
}

const withBookmarkRow = <T extends InjectedProps>(
  Component: React.ComponentType<T>
) =>
  memo<Subtract<T, InjectedProps> & ExpectedProps>(function BookmarkRowHoc(
    props
  ) {
    const { isDir, name, url, pos, isSelected, editBookmark } = props;
    const prevEditBookmark = usePrevious(editBookmark);
    const primaryUniqueId = (isDir ? name : url) || "";

    useEffect(() => {
      //TODO: Scroll into view after dialog close
      const node = document.querySelector<HTMLDivElement>(
        `[data-text='${primaryUniqueId}']`
      );
      if (prevEditBookmark && !editBookmark && node) {
        node.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, [editBookmark, prevEditBookmark, primaryUniqueId]);

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
            data-is-selected={isSelected}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
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
          </Box>
        )}
      </Draggable>
    );
  });

export default withBookmarkRow;
