'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@bypass/ui';
import { use } from 'react';

import useIsMobile from '../../../hooks/useIsMobile';
import DynamicContext from '../../../provider/DynamicContext';
import useTaggedPersons from '../../Persons/hooks/useTaggedPersons';
import Favicon from './Favicon';
import PersonAvatars from './PersonAvatars';

interface BookmarkProps {
  id: string;
  url: string;
  title: string;
  taggedPersons: string[];
  pos?: number;
  isSelected?: boolean;
  handleSelectedChange?: (pos: number, isOnlySelection: boolean) => void;
}

function Bookmark({
  id,
  url,
  title,
  pos = 0,
  taggedPersons,
  isSelected,
  handleSelectedChange,
}: BookmarkProps) {
  const { tabs } = use(DynamicContext);
  const { data: personsWithImageUrls } = useTaggedPersons(taggedPersons);
  const isMobile = useIsMobile();

  const handleOpenLink: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    tabs.open(url);
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
            <Favicon url={url} />
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
      <div
        className="flex-1 truncate text-sm"
        data-context-id={id}
        data-testid={`bookmark-title-${title}`}
      >
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
