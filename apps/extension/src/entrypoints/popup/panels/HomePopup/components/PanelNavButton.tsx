import { Button } from '@bypass/ui';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { useLocation } from 'wouter';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';

interface Props {
  label: string;
  icon: IconSvgElement;
  route: string;
}

function PanelNavButton({ label, icon, route }: Props) {
  const [, navigate] = useLocation();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);

  return (
    <Button
      className="w-full font-medium"
      variant="secondary"
      disabled={!isSignedIn}
      onClick={() => navigate(route)}
    >
      {label}
      <HugeiconsIcon icon={icon} strokeWidth={2} className="ml-2 size-4" />
    </Button>
  );
}

export default PanelNavButton;
