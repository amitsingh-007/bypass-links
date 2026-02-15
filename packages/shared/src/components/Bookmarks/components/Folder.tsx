'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Folder01Icon } from '@hugeicons/core-free-icons';
import { memo, useContext } from 'react';
import { cn } from '@bypass/ui/lib/utils';
import DynamicContext from '../../../provider/DynamicContext';
import { getBookmarksPanelUrl } from '../utils/url';

export interface FolderProps {
  id: string;
  name: string;
  isEmpty: boolean;
  resetSelectedBookmarks?: React.MouseEventHandler<HTMLDivElement>;
}

const Folder = memo<FolderProps>(
  ({ id, name: origName, isEmpty, resetSelectedBookmarks }) => {
    const { location } = useContext(DynamicContext);

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
        <HugeiconsIcon icon={Folder01Icon} className="size-5 text-yellow-400" />
        <span className="flex-1 truncate text-[0.9375rem] font-bold">
          {origName}
        </span>
      </div>
    );
  }
);

export default Folder;
