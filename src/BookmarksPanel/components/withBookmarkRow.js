import { Box, MenuItem } from "@material-ui/core";
import { BlackMenu } from "GlobalComponents/StyledComponents";
import React, { memo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";

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

    return (
      <Draggable
        draggableId={props.isDir ? props.name : props.url}
        index={props.pos}
      >
        {(provided) => (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            paddingLeft="12px"
            paddingRight="9px"
            paddingY="5px"
            className="bookmarkRowContainer"
            onContextMenu={handleOptionsOpen}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Box
              display="flex"
              alignItems="center"
              flexGrow="1"
              maxWidth="747px"
            >
              <Component {...props} renderMenu={renderMenu} />
            </Box>
          </Box>
        )}
      </Draggable>
    );
  });

export default withBookmarkRow;
