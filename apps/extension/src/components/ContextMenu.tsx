import { HEADER_HEIGHT } from '@bypass/shared';
import { Box, Menu, useMantineTheme } from '@mantine/core';
import { useWindowEvent } from '@mantine/hooks';
import { useState } from 'react';
import { IconType } from 'react-icons';

export interface IMenuOptions {
  text: string;
  icon: IconType;
  onClick: (id: string) => void;
  color?: string;
}

interface Props {
  options: IMenuOptions[];
  children: React.ReactNode;
  mount?: boolean;
  adjustOffset?: boolean;
}

const ContextMenu = ({
  options,
  mount = true,
  children,
  adjustOffset = true,
}: Props) => {
  const theme = useMantineTheme();
  const [points, setPoints] = useState({ x: 0, y: 0 });
  const [id, setId] = useState('');

  useWindowEvent('click', () => setPoints({ x: 0, y: 0 }));

  const handleContextMenu: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    setId(target.getAttribute('data-context-id') ?? '');
    setPoints({
      x: e.clientX,
      y: e.clientY - (adjustOffset ? HEADER_HEIGHT : 0),
    });
  };

  const showMenu = mount && points.x !== 0 && points.y !== 0;

  return (
    <>
      <Box w="100%" h="100%" onContextMenu={handleContextMenu}>
        {children}
      </Box>
      <Box
        pos="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display={showMenu ? 'block' : 'none'}
        sx={{ zIndex: 7000 }}
      >
        <Box pos="absolute" top={points.y} left={points.x}>
          <Menu
            id="context-menu"
            radius="md"
            shadow="xl"
            opened={showMenu}
            transitionProps={{
              transition: 'pop-top-left',
              duration: 200,
              exitDuration: 0,
            }}
          >
            <Menu.Dropdown>
              {options.map(
                ({
                  text,
                  icon: Icon,
                  onClick,
                  color = theme.colors.blue[8],
                }) => {
                  const isRedColor = theme.colors.red.includes(color);
                  return (
                    <Menu.Item
                      key={text}
                      px="0.5rem"
                      py="0.375rem"
                      icon={<Icon color={color} size="0.875rem" />}
                      color={isRedColor ? 'red' : undefined}
                      onClick={() => onClick(id)}
                    >
                      {text}
                    </Menu.Item>
                  );
                }
              )}
            </Menu.Dropdown>
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default ContextMenu;
