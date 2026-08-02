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
    const dataCtxId = (e.target as HTMLElement).dataset.contextId ?? '';
    idRef.current = dataCtxId;
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
            key={text}
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
