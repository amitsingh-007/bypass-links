import {
  Bookmark,
  type ContextBookmark,
  Folder,
  type IBookmarksObj,
  isFolderEmpty,
} from '@bypass/shared';

interface Props {
  bookmark: ContextBookmark;
  folders: IBookmarksObj['folders'];
}

function VirtualRow({ bookmark, folders }: Props) {
  return (
    <div className="h-full cursor-pointer rounded-md select-none hover:bg-muted">
      {bookmark.isDir ? (
        <Folder
          id={bookmark.id}
          name={bookmark.name}
          isEmpty={isFolderEmpty(folders, bookmark.id)}
        />
      ) : (
        <Bookmark
          id={bookmark.id}
          url={bookmark.url}
          title={bookmark.title}
          taggedPersons={bookmark.taggedPersons}
        />
      )}
    </div>
  );
}

export default VirtualRow;
