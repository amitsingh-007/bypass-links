import { Bookmark, type ContextBookmark, isFolderEmpty } from '@bypass/shared';
import { cn } from '@bypass/ui/lib/utils';
import { useShallow } from 'zustand/react/shallow';

import useBookmarkStore from '../store/useBookmarkStore';
import FolderRow from './FolderRow';

interface Props {
  bookmark: ContextBookmark;
  pos: number;
  isSelected: boolean;
  isCut: boolean;
}

function VirtualRow({ bookmark, pos, isSelected, isCut }: Props) {
  const {
    handleFolderRemove,
    handleFolderRename,
    handleToggleDefaultFolder,
    resetSelectedBookmarks,
    handleSelectedChange,
  } = useBookmarkStore(
    useShallow((state) => ({
      handleFolderRemove: state.handleFolderRemove,
      handleFolderRename: state.handleFolderRename,
      handleToggleDefaultFolder: state.handleToggleDefaultFolder,
      resetSelectedBookmarks: state.resetSelectedBookmarks,
      handleSelectedChange: state.handleSelectedChange,
    }))
  );
  // Narrowed to this row, so a folder change no longer re-renders every row
  const isEmptyFolder = useBookmarkStore(
    (state) => bookmark.isDir && isFolderEmpty(state.folders, bookmark.id)
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
