import { cn } from '@bypass/ui/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading03Icon } from '@hugeicons/core-free-icons';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
      strokeWidth={2}
    />
  );
}

export { Spinner };
