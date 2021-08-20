import { Box } from "@material-ui/core";
import { DraggableProvided } from "react-beautiful-dnd";

const DragClone: React.FC<{ provided: DraggableProvided; dragCount: number }> =
  ({ provided, dragCount }) => (
    <Box
      className="bookmarkRowContainer"
      data-is-selected="true"
      sx={{
        width: "100%",
        py: "2px",
        pl: "12px",
        pr: "9px",
        fontSize: "14px",
        verticalAlign: "middle",
        textAlign: "center",
      }}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >{`Currently dragging: ${dragCount} bookmarks/folders`}</Box>
  );

export default DragClone;
