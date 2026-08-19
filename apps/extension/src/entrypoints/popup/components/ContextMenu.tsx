import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@bypass/ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRef } from 'react';

export interface IMenuOption {
  text: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
  onClick: (id: string) => void;
  variant?: 'default' | 'destructive';
  id: string;
}

interface Props {
  options: IMenuOption[];
  children: React.ReactNode;
}

function ContextMenuWrapper({ options, children }: Props) {
  const idRef = useRef('');

  const handleContextMenu = (e: React.MouseEvent) => {
    // Nearest ancestor, not the target: a right-click landing on a row's favicon
    // or avatars would otherwise resolve to no id at all
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-context-id]'
    );
    idRef.current = target?.dataset.contextId ?? '';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="size-full"
        onContextMenu={handleContextMenu}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-40">
        {options.map(({ id, text, icon, variant, onClick }) => (
          <ContextMenuItem
            key={id}
            data-testid={`context-menu-item-${id}`}
            className="gap-2"
            variant={variant}
            onClick={() => {
              onClick(idRef.current);
              idRef.current = '';
            }}
          >
            <HugeiconsIcon icon={icon} className="size-4" />
            <span>{text}</span>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default ContextMenuWrapper;
