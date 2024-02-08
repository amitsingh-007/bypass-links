import {
  Box,
  MantineColor,
  MantineStyleProps,
  useMantineTheme,
} from '@mantine/core';
import { ContextMenuItemOptions, useContextMenu } from 'mantine-contextmenu';
import { PropsWithChildren, useMemo, useRef } from 'react';
import { IconType } from '@react-icons/all-files';
import styles from './styles/ContextMenu.module.css';

export interface IMenuOption {
  text: string;
  icon: IconType;
  onClick: (id: string) => void;
  color?: MantineColor;
}

type Props = PropsWithChildren<{
  wrapperHeight?: MantineStyleProps['h'];
  options: IMenuOption[];
  children: React.ReactNode;
}>;

const ContextMenu = ({ wrapperHeight = '100%', options, children }: Props) => {
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
    classNames: {
      root: styles.root,
      item: styles.item,
    },
  });

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const dataCtxId =
      (e.target as HTMLElement).getAttribute('data-context-id') ?? '';
    idRef.current = dataCtxId;
    contextMenuHandler(e);
  };

  return (
    <Box w="100%" h={wrapperHeight} onContextMenu={handleContextMenu}>
      {children}
    </Box>
  );
};

export default ContextMenu;
