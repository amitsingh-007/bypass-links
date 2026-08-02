import {
  Bookmark,
  type ContextBookmarks,
  Folder,
  type IBookmarksObj,
  isFolderEmpty,
} from '@bypass/shared';
import { memo } from 'react';

interface Props {
  index: number;
  folders: IBookmarksObj['folders'];
  contextBookmarks: ContextBookmarks;
}

const VirtualRow = memo<Props>(({ index, folders, contextBookmarks }) => {
  const ctx = contextBookmarks[index];

  return (
    <div className="h-full cursor-pointer rounded-md select-none hover:bg-muted">
      {ctx.isDir ? (
        <Folder
          id={ctx.id}
          name={ctx.name}
          isEmpty={isFolderEmpty(folders, ctx.id)}
        />
      ) : (
        <Bookmark
          id={ctx.id}
          url={ctx.url}
          title={ctx.title}
          taggedPersons={ctx.taggedPersons}
        />
      )}
    </div>
  );
});

export default VirtualRow;
