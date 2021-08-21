import { Box, MenuItem, Typography } from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import { VoidFunction } from "GlobalInterfaces/custom";
import { MenuOption } from "GlobalInterfaces/menu";
import { memo } from "react";
import useMenu from "SrcPath/hooks/useMenu";
import { RightClickMenu } from "./StyledComponents";

type Props = {
  getMenuOptions: () => MenuOption[];
  showMenu?: boolean;
  onOpen?: VoidFunction;
  children: React.ReactNode;
  containerStyles?: SxProps;
};

const ContextMenu = memo<Props>(function ContextMenu({
  getMenuOptions,
  showMenu = true,
  onOpen,
  containerStyles = {},
  children,
}) {
  const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();

  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    if (showMenu) {
      onOpen && onOpen();
      onMenuOpen(event);
    }
  };

  const renderMenu = () =>
    getMenuOptions().map(({ text, icon: Icon, onClick }) => (
      <MenuItem
        key={text}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
          onMenuClose();
        }}
        sx={{ padding: "3px 12px" }}
      >
        <Icon sx={{ mr: "12px", fontSize: 20 }} />
        <Typography sx={{ fontSize: "15px" }}>{text}</Typography>
      </MenuItem>
    ));

  return (
    <>
      <Box
        sx={{ height: "100%", width: "100%", ...containerStyles }}
        onContextMenu={handleRightClick}
      >
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
