import { Button } from '@mantine/core';
import { memo, useMemo } from 'react';
import { BsArrowDown, BsArrowUp } from 'react-icons/bs';

interface Props {
  itemsSize: number;
  onScroll: (itemNumber: number) => void;
  minItemsReqToShow?: number;
}

export const ScrollButton = memo<Props>(function ScrollButton({
  itemsSize,
  onScroll,
  minItemsReqToShow: minItemsToScroll = 0,
}) {
  const buttonConfig = useMemo(
    () => [
      {
        text: 'Top',
        icon: <BsArrowUp />,
        onClick: () => onScroll(0),
      },
      {
        text: 'Bottom',
        icon: <BsArrowDown />,
        onClick: () => onScroll(itemsSize),
      },
    ],
    [itemsSize, onScroll]
  );

  return minItemsToScroll > 0 && itemsSize <= minItemsToScroll ? null : (
    <Button.Group
      orientation="vertical"
      pos="fixed"
      bottom="0.5625rem"
      right="1rem"
      sx={{ zIndex: 1 }}
    >
      {buttonConfig.map(({ icon, text, onClick }) => (
        <Button
          key={text}
          compact
          size="sm"
          color="violet"
          leftIcon={icon}
          styles={{
            inner: { justifyContent: 'flex-start' },
            leftIcon: { marginRight: '0.0625rem' },
          }}
          onClick={onClick}
        >
          {text}
        </Button>
      ))}
    </Button.Group>
  );
});
