import { Box } from "@material-ui/core";
import { DraggableProvided } from "react-beautiful-dnd";

const DragClone: React.FC<{ provided: DraggableProvided; dragCount: number }> =
  ({ provided, dragCount }) => (
    <Box
      className="bookmarkRowContainer"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        py: "2px",
        fontSize: "14px",
      }}
      data-is-selected="true"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >{`Currently dragging: ${dragCount} bookmarks/folders`}</Box>
  );

export default DragClone;
