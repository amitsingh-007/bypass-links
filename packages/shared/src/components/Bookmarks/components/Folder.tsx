'use client';

import { cn } from '@bypass/ui/lib/utils';
import { Folder01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useDynamicContext } from '../../../provider/DynamicContext';
import { getBookmarksPanelUrl } from '../utils/url';

export interface FolderProps {
  id: string;
  name: string;
  isEmpty: boolean;
  resetSelectedBookmarks?: React.MouseEventHandler<HTMLDivElement>;
}

function Folder({
  id,
  name: origName,
  isEmpty,
  resetSelectedBookmarks,
}: FolderProps) {
  const { location } = useDynamicContext();

  const handleFolderOpen = () => {
    if (!isEmpty) {
      location.push(getBookmarksPanelUrl({ folderId: id }));
    }
  };

  return (
    <div
      className={cn(
        'flex size-full items-center justify-center gap-3 p-1.5',
        isEmpty && 'cursor-not-allowed opacity-60'
      )}
      data-testid={`folder-item-${origName}`}
      onClick={resetSelectedBookmarks}
      onDoubleClick={handleFolderOpen}
    >
      <HugeiconsIcon icon={Folder01Icon} className="size-5 text-folder" />
      <span className="flex-1 truncate text-folder-name font-bold">
        {origName}
      </span>
    </div>
  );
}

export default Folder;
