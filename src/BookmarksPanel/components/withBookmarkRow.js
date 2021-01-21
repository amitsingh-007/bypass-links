import { Box, MenuItem } from "@material-ui/core";
import { BlackMenu } from "GlobalComponents/StyledComponents";
import { memo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useLongPress } from "use-long-press";

const initialMouseState = {
  mouseX: null,
  mouseY: null,
};

const getAnchorPosition = ({ mouseX, mouseY }) =>
  mouseY !== null && mouseX !== null
    ? { top: mouseY, left: mouseX }
    : undefined;

const withBookmarkRow = (Component) =>
  memo((props) => {
    const [mouseState, setMouseState] = useState(initialMouseState);

    const handleOptionsOpen = (event) => {
      event.preventDefault();
      setMouseState({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
      });
    };
    const handleOptionsClose = () => {
      setMouseState(initialMouseState);
    };

    const bindLongPress = useLongPress(handleOptionsOpen, {
      captureEvent: true,
      detect: "touch",
    });

    const renderMenu = (menuItemOptionList) => (
      <BlackMenu
        open={mouseState.mouseY !== null}
        onClose={handleOptionsClose}
        anchorReference="anchorPosition"
        anchorPosition={getAnchorPosition(mouseState)}
      >
        {menuItemOptionList.map(({ text, onClick }) => (
          <MenuItem
            key={text}
            onClick={() => {
              onClick();
              handleOptionsClose();
            }}
          >
            {text}
          </MenuItem>
        ))}
      </BlackMenu>
    );

    const { isDir, name, url, pos, title } = props;
    const primaryUniqueId = isDir ? name : url;
    const secondaryUniqueId = isDir ? null : title;
    return (
      <Draggable draggableId={primaryUniqueId} index={pos}>
        {(provided) => (
          <Box
            className="bookmarkRowContainer"
            onContextMenu={handleOptionsOpen}
            ref={provided.innerRef}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingLeft: "12px",
              paddingRight: "9px",
              paddingY: "5px",
            }}
            data-text={primaryUniqueId}
            data-subtext={secondaryUniqueId}
            {...bindLongPress}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: "1",
                maxWidth: "747px",
              }}
            >
              <Component {...props} renderMenu={renderMenu} />
            </Box>
          </Box>
        )}
      </Draggable>
    );
  });

export default withBookmarkRow;
