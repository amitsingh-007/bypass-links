import { Badge, Button, Flex, Group } from '@mantine/core';
import { memo, useContext } from 'react';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { HEADER_HEIGHT } from '../constants';
import DynamicContext from '../provider/DynamicContext';
import Search from './Search';
import styles from './styles/Header.module.css';

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
    <Flex
      component="header"
      className={styles.container}
      style={{ height: HEADER_HEIGHT }}
      py={0}
      px={10}
      justify="space-between"
    >
      <Group>
        <Button
          size="xs"
          radius="xl"
          color="red"
          leftSection={<HiOutlineArrowNarrowLeft />}
          onClick={onBackClick ?? location.goBack}
        >
          Back
        </Button>
        {children}
      </Group>
      <Group justify="flex-end">
        {onSearchChange ? <Search onChange={onSearchChange} /> : null}
        {text ? (
          <Badge size="lg" radius="lg" className={styles.badge}>
            {text}
          </Badge>
        ) : null}
        {RightContent}
      </Group>
    </Flex>
  );
});

export default Header;
