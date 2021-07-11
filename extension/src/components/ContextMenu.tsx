import { Box, MenuItem, Typography } from "@material-ui/core";
import { MenuOptions } from "GlobalInterfaces/menu";
import { memo } from "react";
import useMenu from "SrcPath/hooks/useMenu";
import { RightClickMenu } from "./StyledComponents";

type Props = {
  menuOptions: MenuOptions[];
  showMenu?: boolean;
  onOpen?: () => void;
};

const ContextMenu = memo<Props>(
  ({ menuOptions, showMenu = true, onOpen, children }) => {
    const [isMenuOpen, menuPos, onMenuClose, onMenuOpen] = useMenu();

    const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
      onOpen && onOpen();
      onMenuOpen(event);
    };

    const renderMenu = () =>
      menuOptions.map(({ text, icon: Icon, onClick }) => (
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
          sx={{ height: "100%", width: "100%" }}
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
  }
);

export default ContextMenu;
