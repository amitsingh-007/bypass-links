import { Button } from '@mantine/core';
import { memo, useMemo } from 'react';
import { BsArrowDown, BsArrowUp } from 'react-icons/bs';
import styles from './styles/ScrollButton.module.css';

interface Props {
  itemsSize: number;
  onScroll: (itemNumber: number) => void;
}

export const ScrollButton = memo<Props>(({ itemsSize, onScroll }) => {
  const buttonConfig = useMemo(
    () => [
      {
        text: 'Top',
        icon: BsArrowUp,
        onClick: () => onScroll(0),
      },
      {
        text: 'Bottom',
        icon: BsArrowDown,
        onClick: () => onScroll(itemsSize),
      },
    ],
    [itemsSize, onScroll]
  );

  if (itemsSize === 0) {
    return null;
  }

  return (
    <Button.Group
      orientation="vertical"
      pos="fixed"
      bottom="0.5625rem"
      right="1rem"
      className={styles.container}
    >
      {buttonConfig.map(({ icon: Icon, text, onClick }) => (
        <Button
          key={text}
          color="violet"
          size="compact-sm"
          leftSection={<Icon />}
          classNames={{ inner: styles.buttonInner }}
          onClick={onClick}
        >
          {text}
        </Button>
      ))}
    </Button.Group>
  );
});
