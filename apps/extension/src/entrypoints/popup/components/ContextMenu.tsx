import { HugeiconsIcon } from '@hugeicons/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@bypass/ui';
import { useMemo, useRef } from 'react';

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

  const menuOptions = useMemo(() => {
    return options.map((option) => {
      const { text, onClick, icon, variant } = option;

      return {
        key: text,
        title: text,
        icon,
        variant,
        onClick() {
          onClick(idRef.current);
          idRef.current = '';
        },
      };
    });
  }, [options]);

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
        {menuOptions.map((option) => (
          <ContextMenuItem
            key={option.key}
            className="gap-2"
            variant={option.variant}
            onClick={option.onClick}
          >
            <HugeiconsIcon icon={option.icon} className="size-4" />
            <span>{option.title}</span>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default ContextMenuWrapper;
