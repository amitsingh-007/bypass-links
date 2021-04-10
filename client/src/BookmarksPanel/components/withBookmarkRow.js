import { Box, MenuItem } from "@material-ui/core";
import { BlackMenu } from "GlobalComponents/StyledComponents";
import { memo } from "react";
import { Draggable } from "react-beautiful-dnd";
import Ripples from "react-ripples";
import useMenu from "SrcPath/hooks/useMenu";
import { bookmarkRowStyles } from "../constants";

const withBookmarkRow = (Component) =>
  memo((props) => {
    const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();

    const renderMenu = (menuItemOptionList) => (
      <BlackMenu
        open={isMenuOpen}
        onClose={onMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={menuPos}
      >
        {menuItemOptionList.map(({ text, onClick }) => (
          <MenuItem
            key={text}
            onClick={() => {
              onClick();
              onMenuClose();
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
            onContextMenu={onMenuOpen}
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
                <Component
                  {...props}
                  renderMenu={renderMenu}
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
