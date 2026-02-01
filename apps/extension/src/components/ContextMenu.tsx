import {
  Box,
  type MantineColor,
  type MantineStyleProps,
  useMantineTheme,
} from '@mantine/core';
import {
  type ContextMenuItemOptions,
  useContextMenu,
} from 'mantine-contextmenu';
import { type PropsWithChildren, useMemo, useRef } from 'react';
import { type IconType } from 'react-icons';
import styles from './styles/ContextMenu.module.css';

export interface IMenuOption {
  text: string;
  icon: IconType;
  onClick: (id: string) => void;
  color?: MantineColor;
  id: string;
}

type Props = PropsWithChildren<{
  wrapperHeight?: MantineStyleProps['h'];
  options: IMenuOption[];
  children: React.ReactNode;
}>;

function ContextMenu({ wrapperHeight = '100%', options, children }: Props) {
  const theme = useMantineTheme();
  const { showContextMenu } = useContextMenu();
  const idRef = useRef('');

  const menuOptions = useMemo(() => {
    return options.map<ContextMenuItemOptions>((option) => {
      const {
        text,
        onClick,
        icon: Icon,
        color = theme.colors.blue[8],
        id,
      } = option;
      const isRedColor = theme.colors.red.includes(color);
      const className = `context-menu-item-${id}`;

      return {
        key: text,
        title: text,
        className,
        icon: <Icon size="0.875rem" color={color} />,
        color: isRedColor ? 'red' : undefined,
        onClick() {
          onClick(idRef.current);
          idRef.current = '';
        },
      };
    });
  }, [options, theme.colors]);

  const contextMenuHandler = showContextMenu(menuOptions, {
    classNames: {
      root: styles.root,
      item: styles.item,
    },
  });

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const dataCtxId = (e.target as HTMLElement).dataset.contextId ?? '';
    idRef.current = dataCtxId;
    contextMenuHandler(e);
  };

  return (
    <Box w="100%" h={wrapperHeight} onContextMenu={handleContextMenu}>
      {children}
    </Box>
  );
}

export default ContextMenu;
