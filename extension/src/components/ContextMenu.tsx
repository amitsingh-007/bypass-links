import { Box, MenuItem, Typography, SvgIcon } from '@mui/material';
import { SxProps } from '@mui/system';
import { VoidFunction } from '@bypass/shared/interfaces/custom';
import { IMenuOptions, MenuOption } from '@interfaces/menu';
import { memo, useState } from 'react';
import useMenu from '@/hooks/useMenu';
import { RightClickMenu } from './StyledComponents';

const MenuItemWrapper = ({
  id,
  onMenuClose,
  menuOption,
  styles = {},
}: {
  id: string;
  onMenuClose: VoidFunction;
  menuOption: MenuOption;
  styles?: SxProps;
}) => {
  const { text, icon: Icon, onClick } = menuOption;
  return (
    <MenuItem
      onClick={(event) => {
        event.stopPropagation();
        onClick(id);
        onMenuClose();
      }}
      sx={{ padding: '3px 12px', ...styles }}
    >
      <SvgIcon sx={{ mr: '12px', fontSize: 20 }}>
        <Icon />
      </SvgIcon>
      <Typography sx={{ fontSize: '15px' }}>{text}</Typography>
    </MenuItem>
  );
};

type Props = {
  getMenuOptions: () => IMenuOptions;
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
  const [id, setId] = useState('');

  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    if (showMenu) {
      const target = event.target as HTMLElement;
      setId(target.getAttribute('data-context-id') ?? '');
      onOpen && onOpen();
      onMenuOpen(event);
    }
  };

  const renderMenu = () =>
    getMenuOptions().map((option, index) =>
      Array.isArray(option) ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between' }}
          key={index}
        >
          {option.map((menuOption, index) => (
            <MenuItemWrapper
              key={index}
              id={id}
              onMenuClose={onMenuClose}
              menuOption={menuOption}
              styles={{ flexGrow: index !== option.length - 1 ? 1 : 'unset' }}
            />
          ))}
        </Box>
      ) : (
        <MenuItemWrapper
          key={index}
          id={id}
          onMenuClose={onMenuClose}
          menuOption={option}
        />
      )
    );

  return (
    <>
      <Box
        sx={{ height: '100%', width: '100%', ...containerStyles }}
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
