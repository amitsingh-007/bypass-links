import { Button } from '@mantine/core';
import { BsArrowDown, BsArrowUp } from 'react-icons/bs';

interface Props {
  pos: number;
  total: number;
  handleRuleMoveUp: (pos: number) => void;
  handleRuleMoveDown: (pos: number) => void;
}

export function ReorderButton({
  pos,
  total,
  handleRuleMoveUp,
  handleRuleMoveDown,
}: Props) {
  return (
    <Button.Group orientation="horizontal" ml={2} mr={10}>
      <Button
        variant="light"
        h="full"
        pl={2}
        pr={2}
        mr={1}
        disabled={pos === 0}
        data-testid={`rule-${pos}-move-up`}
        onClick={() => handleRuleMoveUp(pos)}
      >
        <BsArrowUp size={12} strokeWidth={1.1} />
      </Button>
      <Button
        variant="light"
        h="full"
        pl={2}
        pr={2}
        disabled={pos === total - 1}
        data-testid={`rule-${pos}-move-down`}
        onClick={() => handleRuleMoveDown(pos)}
      >
        <BsArrowDown size={12} strokeWidth={1.1} />
      </Button>
    </Button.Group>
  );
}
