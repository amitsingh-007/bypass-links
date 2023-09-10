import { Badge, Button, Group, Header as MantineHeader } from '@mantine/core';
import { memo, useContext } from 'react';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { HEADER_HEIGHT } from '../constants';
import DynamicContext from '../provider/DynamicContext';
import { getMediaQuery } from '../utils/mediaQuery';
import Search from './Search';

interface Props {
  children?: React.ReactNode;
  text?: React.ReactNode;
  onSearchChange?: (text: string) => void;
  rightContent?: React.ReactNode;
  onBackClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Header = memo<Props>(function Header({
  children,
  text,
  onSearchChange,
  rightContent: RightContent = null,
  onBackClick,
}) {
  const { location } = useContext(DynamicContext);

  return (
    <MantineHeader
      height={HEADER_HEIGHT}
      py={0}
      px={10}
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'space-between',
        // Handle web headers
        [theme.fn.largerThan('md')]: {
          border: `1px solid ${theme.colors.dark[5]}`,
          borderBottomLeftRadius: '0.375rem',
          borderBottomRightRadius: '0.375rem',
        },
      })}
    >
      <Group>
        <Button
          size="xs"
          radius="xl"
          color="red"
          leftIcon={<HiOutlineArrowNarrowLeft />}
          onClick={onBackClick ?? location.goBack}
        >
          Back
        </Button>
        {children}
      </Group>
      <Group sx={{ justifyContent: 'flex-end' }}>
        {onSearchChange ? <Search onChange={onSearchChange} /> : null}
        {text ? (
          <Badge
            size="lg"
            radius="lg"
            sx={(theme) =>
              getMediaQuery(theme, { display: ['none', 'initial'] })
            }
          >
            {text}
          </Badge>
        ) : null}
        {RightContent}
      </Group>
    </MantineHeader>
  );
});

export default Header;
