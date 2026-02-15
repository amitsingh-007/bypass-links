import { Button, ButtonGroup } from '@bypass/ui';
import { ArrowUp01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';

interface Props {
  itemsSize: number;
  onScroll: (itemNumber: number) => void;
}

export const ScrollButton = memo<Props>(({ itemsSize, onScroll }) => {
  if (itemsSize === 0) {
    return null;
  }

  return (
    <ButtonGroup orientation="vertical" className="fixed right-3 bottom-3 z-10">
      <Button
        variant="secondary"
        size="sm"
        className="bg-secondary/20 justify-start backdrop-blur-sm"
        onClick={() => onScroll(0)}
      >
        <HugeiconsIcon icon={ArrowUp01Icon} />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="bg-secondary/20 justify-start backdrop-blur-sm"
        onClick={() => onScroll(itemsSize)}
      >
        <HugeiconsIcon icon={ArrowDown01Icon} />
      </Button>
    </ButtonGroup>
  );
});
