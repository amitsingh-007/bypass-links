import { Badge, Button } from '@bypass/ui';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import Search from './Search';

interface Props {
  children?: React.ReactNode;
  text?: React.ReactNode;
  onSearchChange?: (text: string) => void;
  rightContent?: React.ReactNode;
  onBackClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function Header({
  children,
  text,
  onSearchChange,
  rightContent: RightContent = null,
  onBackClick,
}: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-2.5">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onBackClick ?? (() => window.history.back())}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Back
        </Button>
        {children}
      </div>
      <div className="flex items-center justify-end gap-2">
        {onSearchChange ? <Search onChange={onSearchChange} /> : null}
        {text !== undefined && (
          <Badge
            data-testid="header-badge"
            variant="secondary"
            className="hidden h-8 sm:inline-flex"
          >
            {text}
          </Badge>
        )}
        {RightContent}
      </div>
    </header>
  );
}

export default Header;
