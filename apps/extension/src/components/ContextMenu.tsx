import {
  Box,
  MantineColor,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { useContextMenu } from 'mantine-contextmenu';
import { ContextMenuItemOptions } from 'mantine-contextmenu/dist/types';
import { useMemo, useRef } from 'react';
import { IconType } from 'react-icons';

export interface IMenuOption {
  text: string;
  icon: IconType;
  onClick: (id: string) => void;
  color?: MantineColor;
}

interface Props {
  options: IMenuOption[];
  children: React.ReactNode;
}

const useStyles = createStyles((theme) => ({
  root: {
    padding: 4,
    backgroundColor: theme.colors.dark[6],
  },
  item: {
    borderRadius: 8,
    padding: '0.375rem 0.5rem',
    '> div': {
      lineHeight: 0,
    },
  },
}));

const ContextMenu = ({ options, children }: Props) => {
  const theme = useMantineTheme();
  const showContextMenu = useContextMenu();
  const idRef = useRef('');
  const { classes } = useStyles();

  const menuOptions = useMemo(() => {
    return options.map<ContextMenuItemOptions>((option) => {
      const {
        text,
        onClick,
        icon: Icon,
        color = theme.colors.blue[8],
      } = option;
      const isRedColor = theme.colors.red.includes(color);

      return {
        key: text,
        icon: <Icon size="0.875rem" color={color} />,
        color: isRedColor ? 'red' : undefined,
        onClick: () => {
          onClick(idRef.current);
          idRef.current = '';
        },
      };
    });
  }, [options, theme.colors]);

  const contextMenuHandler = showContextMenu(menuOptions, {
    classNames: classes,
  });

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const dataCtxId =
      (e.target as HTMLElement).getAttribute('data-context-id') ?? '';
    idRef.current = dataCtxId;
    contextMenuHandler(e);
  };

  return (
    <Box w="100%" h="100%" onContextMenu={handleContextMenu}>
      {children}
    </Box>
  );
};

export default ContextMenu;
