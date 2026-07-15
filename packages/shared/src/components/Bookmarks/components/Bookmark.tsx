'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@bypass/ui';

import usePlatform from '../../../hooks/usePlatform';
import useTaggedPersons from '../../Persons/hooks/useTaggedPersons';
import Favicon from './Favicon';
import PersonAvatars from './PersonAvatars';

export interface BookmarkProps {
  id: string;
  url: string;
  title: string;
  taggedPersons: string[];
  pos?: number;
  isSelected?: boolean;
  handleSelectedChange?: (pos: number, isOnlySelection: boolean) => void;
  onOpenLink: (url: string) => void;
  getFaviconUrl: (url: string) => string;
}

function Bookmark({
  id,
  url,
  title,
  pos = 0,
  taggedPersons,
  isSelected,
  handleSelectedChange,
  onOpenLink,
  getFaviconUrl,
}: BookmarkProps) {
  const { data: personsWithImageUrls = [] } = useTaggedPersons(taggedPersons);
  const isMobile = usePlatform();

  const handleOpenLink: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    onOpenLink(url);
  };

  const handleSelectionChange = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!handleSelectedChange) {
      return;
    }
    const isCtrlOrCommandKey = event.ctrlKey || event.metaKey;
    handleSelectedChange(pos, !isCtrlOrCommandKey);
  };

  const onRightClick = () => {
    if (!isSelected && handleSelectedChange) {
      handleSelectedChange(pos, true);
    }
  };

  return (
    <div
      className="flex size-full items-center gap-3 px-1.5"
      data-context-id={id}
      data-testid={`bookmark-item-${title}`}
      onDoubleClick={handleOpenLink}
      onClick={handleSelectionChange}
      onContextMenu={onRightClick}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Favicon url={url} getFaviconUrl={getFaviconUrl} />
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="w-auto max-w-[500px] text-xs/relaxed break-all"
          >
            {url}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PersonAvatars persons={personsWithImageUrls} />
      <div className="flex-1 truncate text-sm" data-context-id={id}>
        {isMobile ? (
          <a href={url} title={title} className="text-inherit no-underline">
            {title}
          </a>
        ) : (
          title
        )}
      </div>
    </div>
  );
}

export default Bookmark;
