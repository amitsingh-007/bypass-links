import { Spinner } from '@bypass/ui';

interface Props {
  testId?: string;
}

function LoadingOverlay({ testId = 'loading-overlay' }: Props) {
  return (
    <div
      data-testid={testId}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Spinner className="size-8" />
    </div>
  );
}

export default LoadingOverlay;
