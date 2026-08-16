import { Spinner } from '@bypass/ui';
import { cn } from '@bypass/ui/lib/utils';

interface Props {
  testId?: string;
  className?: string;
}

function LoadingOverlay({ testId = 'loading-overlay', className }: Props) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center bg-black/50',
        className
      )}
    >
      <Spinner className="size-8" />
    </div>
  );
}

export default LoadingOverlay;
