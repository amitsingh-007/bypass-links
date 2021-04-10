import { Box } from "@material-ui/core";
import { memo } from "react";
import { Draggable } from "react-beautiful-dnd";
import Ripples from "react-ripples";
import { bookmarkRowStyles } from "../constants";

const withBookmarkRow = (Component) =>
  memo((props) => {
    const { isDir, name, url, pos, title } = props;
    const primaryUniqueId = isDir ? name : url;
    const secondaryUniqueId = isDir ? null : title;

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
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Ripples>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: "1",
                  maxWidth: "747px",
                }}
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
