import { memo, useContext } from 'react';
import { Badge, Button, Group, Header as MantineHeader } from '@mantine/core';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import Search from '@bypass/shared/components/Search';
import DynamicContext from '../provider/DynamicContext';

interface Props {
  children?: React.ReactNode;
  text?: React.ReactNode;
  onSearchChange?: (text: string) => void;
  rightContent?: React.ReactNode;
  onBackClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const HEADER_HEIGHT = 56;

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
      sx={{ display: 'flex', justifyContent: 'space-between' }}
    >
      <Group>
        <Button
          radius="xl"
          variant="light"
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
          <Badge size="lg" radius="lg">
            {text}
          </Badge>
        ) : null}
        {RightContent}
      </Group>
    </MantineHeader>
  );
});

export default Header;
