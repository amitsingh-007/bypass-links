import { Bookmark, type ContextBookmark } from '@bypass/shared';
import { cn } from '@bypass/ui/lib/utils';

import useBookmarkStore from '../store/useBookmarkStore';
import FolderRow from './FolderRow';

interface Props {
  bookmark: ContextBookmark;
  pos: number;
  isSelected: boolean;
  isCut: boolean;
}

function VirtualRow({ bookmark, pos, isSelected, isCut }: Props) {
  // Selected individually rather than as one object: the actions are stable and
  // `folders` is narrowed to this row, so a folder change no longer re-renders
  // every mounted bookmark row
  const handleFolderRemove = useBookmarkStore((s) => s.handleFolderRemove);
  const handleFolderRename = useBookmarkStore((s) => s.handleFolderRename);
  const handleToggleDefaultFolder = useBookmarkStore(
    (s) => s.handleToggleDefaultFolder
  );
  const resetSelectedBookmarks = useBookmarkStore(
    (s) => s.resetSelectedBookmarks
  );
  const handleSelectedChange = useBookmarkStore((s) => s.handleSelectedChange);
  const isEmptyFolder = useBookmarkStore(
    (s) => bookmark.isDir && !s.folders[bookmark.id]?.length
  );

  return (
    <div
      className={cn(
        'box-border h-full cursor-pointer rounded-md select-none',
        'hover:bg-muted',
        `data-[is-selected=true]:bg-primary data-[is-selected=true]:text-primary-foreground`,
        'data-[is-selected=true]:hover:bg-primary/90',
        `data-[is-cut=true]:border data-[is-cut=true]:border-dashed data-[is-cut=true]:border-border data-[is-cut=true]:opacity-50`
      )}
      // Added to fix context menu
      style={{ zIndex: bookmark.isDir ? 1 : 'auto' }}
      data-is-selected={isSelected}
      data-is-cut={isCut}
    >
      {bookmark.isDir ? (
        <FolderRow
          id={bookmark.id}
          name={bookmark.name}
          isDefault={bookmark.isDefault}
          handleRemove={handleFolderRemove}
          handleEdit={handleFolderRename}
          toggleDefaultFolder={handleToggleDefaultFolder}
          isEmpty={isEmptyFolder}
          resetSelectedBookmarks={resetSelectedBookmarks}
        />
      ) : (
        <Bookmark
          id={bookmark.id}
          pos={pos}
          url={bookmark.url}
          title={bookmark.title}
          taggedPersons={bookmark.taggedPersons}
          isSelected={isSelected}
          handleSelectedChange={handleSelectedChange}
        />
      )}
    </div>
  );
}

export default VirtualRow;
