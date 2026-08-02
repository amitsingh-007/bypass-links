import { Button, ButtonGroup } from '@bypass/ui';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface Props {
  pos: number;
  total: number;
  handleRuleMove: (pos: number, offset: number) => void;
}

export function ReorderButton({ pos, total, handleRuleMove }: Props) {
  return (
    <ButtonGroup className="mx-2">
      <Button
        variant="secondary"
        size="icon-sm"
        disabled={pos === 0}
        data-testid={`rule-${pos}-move-up`}
        onClick={() => handleRuleMove(pos, -1)}
      >
        <HugeiconsIcon icon={ArrowUp01Icon} />
      </Button>
      <Button
        variant="secondary"
        size="icon-sm"
        disabled={pos === total - 1}
        data-testid={`rule-${pos}-move-down`}
        onClick={() => handleRuleMove(pos, 1)}
      >
        <HugeiconsIcon icon={ArrowDown01Icon} />
      </Button>
    </ButtonGroup>
  );
}
