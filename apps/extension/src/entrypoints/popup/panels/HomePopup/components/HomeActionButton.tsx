import { Button, Spinner } from '@bypass/ui';
import { cn } from '@bypass/ui/lib/utils';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { type ComponentProps } from 'react';

import { useIsSignedIn } from '@/store/firebase/useFirebaseStore';

interface Props {
  label: string;
  icon: IconSvgElement;
  onClick: () => void;
  variant?: ComponentProps<typeof Button>['variant'];
  className?: string;
  isBusy?: boolean;
  disabled?: boolean;
  testId?: string;
  /** Only the auth control itself stays usable while signed out. */
  requiresSignIn?: boolean;
}

function HomeActionButton({
  label,
  icon,
  onClick,
  variant = 'secondary',
  className,
  isBusy = false,
  disabled = false,
  testId,
  requiresSignIn = true,
}: Props) {
  const isSignedIn = useIsSignedIn();

  return (
    <Button
      className={cn('w-full font-medium', className)}
      variant={variant}
      disabled={disabled || isBusy || (requiresSignIn && !isSignedIn)}
      data-testid={testId}
      onClick={onClick}
    >
      {isBusy && <Spinner className="mr-2 size-4" />}
      {label}
      <HugeiconsIcon icon={icon} strokeWidth={2} className="ml-2 size-4" />
    </Button>
  );
}

export default HomeActionButton;
