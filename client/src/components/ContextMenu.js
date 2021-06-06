import { Box, MenuItem } from "@material-ui/core";
import { memo } from "react";
import useMenu from "SrcPath/hooks/useMenu";
import { RightClickMenu } from "./StyledComponents";

const ContextMenu = memo(({ menuOptions, showMenu, onOpen, children }) => {
  const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();

  const handleRightClick = (event) => {
    onOpen();
    onMenuOpen(event);
  };

  const renderMenu = () =>
    menuOptions.map(({ text, icon: Icon, onClick }) => (
      <MenuItem
        key={text}
        onClick={() => {
          onClick();
          onMenuClose();
        }}
      >
        <Icon sx={{ mr: "12px" }} />
        {text}
      </MenuItem>
    ));

  return (
    <>
      <Box sx={{ height: "100%" }} onContextMenu={handleRightClick}>
        {children}
      </Box>
      {showMenu ? (
        <RightClickMenu
          open={isMenuOpen}
          onClose={onMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={menuPos}
        >
          {renderMenu()}
        </RightClickMenu>
      ) : null}
    </>
  );
});

export default ContextMenu;
