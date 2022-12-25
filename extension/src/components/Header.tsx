import { memo } from 'react';
import { Badge, Button, Group, Header as MantineHeader } from '@mantine/core';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Search from '@bypass/shared/components/Search';

interface Props {
  children?: React.ReactNode;
  text?: React.ReactNode;
  onSearchChange?: (text: string) => void;
}

const Header = memo<Props>(function Header({ children, text, onSearchChange }) {
  const navigate = useNavigate();

  return (
    <MantineHeader
      height={56}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}
    >
      <Group>
        <Button
          radius="xl"
          variant="light"
          color="red"
          leftIcon={<HiOutlineArrowNarrowLeft />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        {children}
      </Group>
      <Group>
        {onSearchChange ? <Search onChange={onSearchChange} /> : null}
        {text ? (
          <Badge size="lg" radius="lg">
            {text}
          </Badge>
        ) : null}
      </Group>
    </MantineHeader>
  );
});

export default Header;
