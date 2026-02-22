import { type ContextBookmark, isFolderEmpty } from '@bypass/shared';
import { useShallow } from 'zustand/react/shallow';
import clsx from 'clsx';
import useBookmarkStore from '../store/useBookmarkStore';
import BookmarkRow from './BookmarkRow';
import FolderRow from './FolderRow';

export interface Props {
  bookmark: ContextBookmark;
  pos: number;
  isSelected: boolean;
  isCut: boolean;
}

function VirtualRow({ bookmark, pos, isSelected, isCut }: Props) {
  const {
    folders,
    handleFolderRemove,
    handleFolderRename,
    handleToggleDefaultFolder,
    resetSelectedBookmarks,
    handleSelectedChange,
  } = useBookmarkStore(
    useShallow((state) => ({
      folders: state.folders,
      handleFolderRemove: state.handleFolderRemove,
      handleFolderRename: state.handleFolderRename,
      handleToggleDefaultFolder: state.handleToggleDefaultFolder,
      resetSelectedBookmarks: state.resetSelectedBookmarks,
      handleSelectedChange: state.handleSelectedChange,
    }))
  );

  return (
    <div
      className={clsx(
        'box-border h-full cursor-pointer rounded-md select-none',
        'hover:bg-muted',
        `
          data-[is-selected=true]:bg-primary
          data-[is-selected=true]:text-primary-foreground
        `,
        'data-[is-selected=true]:hover:bg-primary/90',
        `
          data-[is-cut=true]:border data-[is-cut=true]:border-dashed
          data-[is-cut=true]:border-border data-[is-cut=true]:opacity-50
        `
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
          isEmpty={isFolderEmpty(folders, bookmark.id)}
          resetSelectedBookmarks={resetSelectedBookmarks}
        />
      ) : (
        <BookmarkRow
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
