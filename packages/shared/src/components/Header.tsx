import { Badge, Button } from '@bypass/ui';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo, useContext, type RefObject } from 'react';
import { HEADER_HEIGHT } from '../constants';
import DynamicContext from '../provider/DynamicContext';
import Search from './Search';

interface Props {
  children?: React.ReactNode;
  text?: React.ReactNode;
  onSearchChange?: (text: string) => void;
  rightContent?: React.ReactNode;
  onBackClick?: React.MouseEventHandler<HTMLButtonElement>;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

const Header = memo<Props>(
  ({
    children,
    text,
    onSearchChange,
    rightContent: RightContent = null,
    onBackClick,
    searchInputRef,
  }) => {
    const { location } = useContext(DynamicContext);

    return (
      <header
        className="border-border flex items-center justify-between border-b px-2.5"
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBackClick ?? location.goBack}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            Back
          </Button>
          {children}
        </div>
        <div className="flex items-center justify-end gap-2">
          {onSearchChange ? (
            <Search ref={searchInputRef} onChange={onSearchChange} />
          ) : null}
          {text ? (
            <Badge
              data-testid="header-badge"
              variant="secondary"
              className="hidden h-8 sm:inline-flex"
            >
              {text}
            </Badge>
          ) : null}
          {RightContent}
        </div>
      </header>
    );
  }
);

export default Header;
