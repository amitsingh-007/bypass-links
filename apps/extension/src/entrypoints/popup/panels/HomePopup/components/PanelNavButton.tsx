import { type IconSvgElement } from '@hugeicons/react';
import { useLocation } from 'wouter';

import HomeActionButton from './HomeActionButton';

interface Props {
  label: string;
  icon: IconSvgElement;
  route: string;
}

function PanelNavButton({ label, icon, route }: Props) {
  const [, navigate] = useLocation();

  return (
    <HomeActionButton
      label={label}
      icon={icon}
      onClick={() => navigate(route)}
    />
  );
}

export default PanelNavButton;
